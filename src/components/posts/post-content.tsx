export function PostContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-theme dark:prose-invert mt-10 max-w-none prose-pre:rounded-none prose-pre:border prose-pre:border-border"
      // Content is authored in this repository and rendered to static HTML at
      // build time; no untrusted input reaches this string.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
