interface MetadataItemProps {
  label: string;
  value: string;
}
export const MetadataListItem = ({ label, value }: MetadataItemProps) => {
  return (
    <li>
      <span className="font-semibold mr-2">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </li>
  );
};
