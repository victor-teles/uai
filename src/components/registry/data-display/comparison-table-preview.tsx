import {
  ComparisonTable,
  ComparisonTableBody,
  ComparisonTableCell,
  ComparisonTableCheck,
  ComparisonTableColumn,
  ComparisonTableContent,
  ComparisonTableCorner,
  ComparisonTableDifferencesToggle,
  ComparisonTableHead,
  ComparisonTableHeader,
  ComparisonTableRow,
  ComparisonTableRowHeader,
  ComparisonTableTitle,
  type ComparisonTableVariant,
} from "@/components/ui/uai/comparison-table";

export function ComparisonTablePreview({
  variant = "bordered",
}: {
  variant?: ComparisonTableVariant;
}) {
  return (
    <ComparisonTable variant={variant} defaultHighlightDifferences>
      <ComparisonTableHeader>
        <ComparisonTableTitle>Compare plans</ComparisonTableTitle>
        <ComparisonTableDifferencesToggle />
      </ComparisonTableHeader>
      <ComparisonTableContent>
        <ComparisonTableHead>
          <ComparisonTableCorner>Feature</ComparisonTableCorner>
          <ComparisonTableColumn>Starter</ComparisonTableColumn>
          <ComparisonTableColumn recommended>Team</ComparisonTableColumn>
          <ComparisonTableColumn>Business</ComparisonTableColumn>
        </ComparisonTableHead>
        <ComparisonTableBody>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>Monthly price</ComparisonTableRowHeader>
            <ComparisonTableCell>$0</ComparisonTableCell>
            <ComparisonTableCell>$12 per seat</ComparisonTableCell>
            <ComparisonTableCell>$24 per seat</ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow>
            <ComparisonTableRowHeader>Unlimited projects</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>Version history</ComparisonTableRowHeader>
            <ComparisonTableCell>7 days</ComparisonTableCell>
            <ComparisonTableCell>90 days</ComparisonTableCell>
            <ComparisonTableCell>Unlimited</ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>SAML single sign-on</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value={false} />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value={false} />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow>
            <ComparisonTableRowHeader>Email support</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
        </ComparisonTableBody>
      </ComparisonTableContent>
    </ComparisonTable>
  );
}
