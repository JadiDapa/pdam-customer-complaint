export default function PageHeader({
  title,
  subtitle,
  hidden,
}: PageHeaderProps) {
  return (
    <div className={`${hidden ? "hidden" : "block"}`}>
      <div className="space-y-1">
        <h1 className="text-primary text-2xl font-semibold capitalize md:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  hidden?: boolean;
}
