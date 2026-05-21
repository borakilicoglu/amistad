import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import type { Job } from "../../lib/data";
import { Tag } from "../../shared/ui";

export function JobRow({
  job,
  active,
  onSelect,
}: {
  job: Job;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`grid w-full gap-3 rounded-3xl border-0 px-4 py-6 text-left ${
        active ? "bg-detail-panel text-ink" : "text-body-copy"
      } transition-colors hover:border-transparent hover:bg-job-hover`}
      type="button"
      onClick={onSelect}
    >
      <span className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <strong className="font-semibold text-ink">{job.company}</strong>
        <span>{job.workMode}</span>
        <span>{job.level}</span>
        {job.posted ? <span>{job.posted}</span> : null}
      </span>
      <span className="text-2xl font-semibold leading-tight">{job.title}</span>
    </button>
  );
}

export function JobDetail({ job }: { job: Job }) {
  const description = formatDescription(job.description);

  return (
    <div className="grid gap-5 p-6">
      <div className="grid gap-2">
        <h2 className="m-0 text-2xl font-semibold">{job.title}</h2>
        <div className="text-body-copy">{job.company}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Tag>{job.location}</Tag>
        <Tag>{job.workMode}</Tag>
        <Tag>{job.level}</Tag>
        {job.easyApply ? <Tag>Easy Apply</Tag> : null}
      </div>
      <a
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
        href={job.url}
        rel="noreferrer"
        target="_blank"
      >
        Open on LinkedIn
        <ArrowSquareOutIcon size={16} />
      </a>
      <div className="grid max-h-[52vh] gap-3 overflow-auto pr-2 text-sm leading-6 text-body-copy">
        {description.map((block, index) =>
          block.type === "heading" ? (
            <h3
              className="m-0 pt-2 text-base font-semibold text-ink"
              key={`${block.text}-${index}`}
            >
              {block.text}
            </h3>
          ) : (
            <p className="m-0" key={`${block.text}-${index}`}>
              {block.text}
            </p>
          ),
        )}
      </div>
    </div>
  );
}

const descriptionHeadings = [
  "Gerekli Yeterlilikler ve Beceriler",
  "Sorumluluklar",
  "Sunduklarımız",
  "What You’ll Be Doing",
  "Who You Are",
  "Bonus Points",
  "Why Skyloop",
] as const;

type DescriptionBlock = {
  type: "heading" | "paragraph";
  text: string;
};

function formatDescription(description?: string): DescriptionBlock[] {
  if (!description) {
    return [{ type: "paragraph", text: "No description captured." }];
  }

  let formatted = description;
  for (const heading of descriptionHeadings) {
    formatted = formatted.replaceAll(heading, `\n\n${heading}\n`);
  }

  return formatted
    .replace(/[•●]\s*/g, "\n\n")
    .replace(/([.!?])(?=[A-ZÇĞİÖŞÜ])/g, "$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .split(/\n+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      type: descriptionHeadings.includes(text as (typeof descriptionHeadings)[number])
        ? "heading"
        : "paragraph",
      text,
    }));
}
