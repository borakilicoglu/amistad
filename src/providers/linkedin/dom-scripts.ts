export function buildFillLinkedinSearchInputScript(role: string) {
  const escapedRole = JSON.stringify(role)

  return `async () => {
    const role = ${escapedRole};
    const selectors = [
      'input[data-testid="typeahead-input"]',
      'input[componentkey="jobSearchBox"]',
      'input[placeholder="Describe the job you want"]',
      'input[placeholder*="Search jobs"]',
      'input[placeholder*="Search by title"]',
      'input[aria-label*="Search by title"]',
      'input[aria-label*="Search jobs"]',
      'input.jobs-search-box__text-input',
      'input[id*="jobs-search-box-keyword-id"]',
    ];

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const describeInput = (input) => [
      input.id,
      input.name,
      input.className,
      input.placeholder,
      input.getAttribute("aria-label"),
      input.getAttribute("data-testid"),
      input.getAttribute("componentkey")
    ].filter(Boolean).join(" ");

    const findInput = () => {
      const bySelector = selectors
        .map((selector) => document.querySelector(selector))
        .find((element) => element instanceof HTMLInputElement);

      if (bySelector) {
        return bySelector;
      }

      const inputs = Array.from(document.querySelectorAll("input"))
        .filter((element) => element instanceof HTMLInputElement);

      return inputs.find((input) => {
        const description = describeInput(input);
        return /job|title|keyword|role|position|search/i.test(description) &&
          !/location|city|where|geo/i.test(description);
      });
    };

    let input = null;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      input = findInput();
      if (input) {
        break;
      }
      await wait(500);
    }

    if (!input) {
      const availableInputs = Array.from(document.querySelectorAll("input"))
        .map((candidate) => describeInput(candidate))
        .filter(Boolean)
        .slice(0, 20);

      throw new Error("LinkedIn job search input was not found. Inputs: " + JSON.stringify(availableInputs));
    }

    input.focus();
    input.click();

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    if (!setter) {
      throw new Error("HTMLInputElement value setter was not found.");
    }

    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(input, role);
    input.dispatchEvent(new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: role,
    }));
    input.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: role,
    }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await wait(300);

    if (input.value !== role) {
      throw new Error("LinkedIn input was found but value was not applied. Current value: " + JSON.stringify(input.value));
    }

    return { filled: true, role, input: describeInput(input), url: location.href, title: document.title };
  }`
}

export function buildApplyPast24HoursFilterScript() {
  return `async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitFor = async (find, label) => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const element = find();
        if (element) return element;
        await wait(500);
      }
      throw new Error(label + " was not found");
    };

    const datePostedControl = await waitFor(
      () =>
        document.querySelector('[aria-label="Filter by Date posted"]')?.closest('[role="button"]') ??
        document.querySelector('[role="button"] [aria-label="Filter by Date posted"]')?.closest('[role="button"]'),
      "Date posted filter",
    );
    datePostedControl.click();

    const past24HoursOption = await waitFor(
      () => document.querySelector('[role="radio"][aria-label="Past 24 hours"]'),
      "Past 24 hours option",
    );
    past24HoursOption.click();

    const showResultsLink = await waitFor(
      () => Array.from(document.querySelectorAll("a")).find((element) =>
        element.textContent?.trim().includes("Show results"),
      ),
      "Show results action",
    );
    showResultsLink.click();

    return {
      applied: true,
      datePostedExpanded: datePostedControl.getAttribute("aria-expanded"),
      past24HoursChecked: past24HoursOption.getAttribute("aria-checked"),
      showResultsHref: showResultsLink.getAttribute("href"),
      url: location.href,
    };
  }`
}

export function buildExtractJobCardsScript() {
  return `async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const cardSelector = '[role="button"][componentkey^="job-card-component-ref-"]';

    let cards = [];
    for (let attempt = 0; attempt < 30; attempt += 1) {
      cards = Array.from(document.querySelectorAll(cardSelector));
      if (cards.length > 0) break;
      await wait(500);
    }

    const clean = (value) => value?.replace(/\\s+/g, " ").trim() ?? "";
    const collapseRepeatedText = (value) => {
      const text = clean(value);
      if (text.length % 2 === 0) {
        const firstHalf = text.slice(0, text.length / 2);
        const secondHalf = text.slice(text.length / 2);
        if (firstHalf === secondHalf) return firstHalf;
      }
      return text;
    };
    const getJobId = (card) =>
      card.getAttribute("componentkey")?.replace("job-card-component-ref-", "") ?? "";

    const jobs = cards.map((card) => {
      const dismissButton = card.querySelector('button[aria-label^="Dismiss "]');
      const dismissLabel = dismissButton?.getAttribute("aria-label") ?? "";
      const title = dismissLabel.replace(/^Dismiss\\s+/, "").replace(/\\s+job$/, "");
      const paragraphs = Array.from(card.querySelectorAll("p"))
        .map((element) => collapseRepeatedText(element.textContent))
        .filter(Boolean);
      const location =
        paragraphs.find((text) => /\\((Remote|Hybrid|On-site)\\)$/i.test(text)) ?? "";
      const company =
        paragraphs.find((text) =>
          text !== title &&
          !text.includes(title) &&
          text !== location &&
          !/^Posted\\s+/i.test(text) &&
          !/\\b(hours?|days?|minutes?) ago\\b/i.test(text) &&
          !/\\bEasy Apply\\b/i.test(text) &&
          text !== "·",
        ) ?? "";
      const postedText =
        paragraphs.find((text) => /^Posted\\s+/i.test(text)) ??
        paragraphs.find((text) => /\\b(hours?|days?|minutes?) ago\\b/i.test(text)) ??
        "";
      const postedMatch = postedText.match(/Posted\\s+.*?(?:minutes?|hours?|days?)\\s+ago/i);
      const posted = postedMatch?.[0] ?? postedText;
      const easyApply = paragraphs.some((text) => /\\bEasy Apply\\b/i.test(text));
      const workModeMatch = location.match(/\\((Remote|Hybrid|On-site)\\)$/i);

      return {
        id: getJobId(card),
        title,
        company,
        location,
        workMode: workModeMatch?.[1]?.toLowerCase().replace("-", "") ?? null,
        posted,
        easyApply,
        dismissLabel,
      };
    });

    return { count: jobs.length, jobs, url: location.href };
  }`
}

