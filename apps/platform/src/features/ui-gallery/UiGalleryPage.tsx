import { useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
  IconButton,
  MenuLink,
  Select,
  StatBlock,
  TextField,
  Toggle,
} from "@repo/ui";
import { useThemePicker } from "@repo/ui";
import type { DefaultTheme } from "styled-components";

type ColorEntry = {
  name: string;
  value: string;
};

const Page = styled.div`
  display: grid;
  gap: 24px;
  padding: 24px;
`;

const Section = styled.section`
  display: grid;
  gap: 16px;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

const SwatchGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

const Swatch = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 12px;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgrounds.soft};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: 12px;
  padding: 8px 12px;
`;

const ColorBox = styled.div<{ $color: string }>`
  width: 48px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
`;

const Label = styled.div`
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};

  span.value {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const EmptySwatchNotice = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const PlaceholderCopy = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const PlaceholderCard = styled.div`
  height: 160px;
  border-radius: 12px;
  background: ${({ theme }) => theme.gradients.primarySoft};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.border.subtle};
`;

const collectColorEntries = (colors: DefaultTheme["colors"] | undefined, prefix: string[] = []): ColorEntry[] => {
  if (!colors || typeof colors !== "object") {
    return [];
  }

  return Object.entries(colors).flatMap(([key, value]) => {
    const path = [...prefix, key];

    if (typeof value === "string") {
      return [{ name: path.join("."), value }];
    }

    if (value && typeof value === "object") {
      return collectColorEntries(value as unknown as DefaultTheme["colors"], path);
    }

    return [];
  });
};

export const UiGalleryPage = (): JSX.Element => {
  const [checked, setChecked] = useState(true);
  const theme = useTheme();
  const { paletteName, setPalette, options } = useThemePicker();

  const colorSwatches = useMemo(() => collectColorEntries(theme?.colors), [theme]);

  const currentLabel = useMemo(
    () => options.find((option) => option.value === paletteName)?.label ?? paletteName,
    [options, paletteName]
  );

  return (
    <Page>
      <Section>
        <Heading>Theme</Heading>
        <Row>
          <Select
            id="theme-picker"
            label="Palette"
            value={paletteName}
            onChange={(event) => setPalette(event.target.value as typeof paletteName)}
            style={{ minWidth: 220 }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Badge variant="accent">{currentLabel}</Badge>
        </Row>
      </Section>

      <Section>
        <Heading>Buttons</Heading>
        <Row>
          <Button size="sm">Primary sm</Button>
          <Button size="md">Primary md</Button>
          <Button size="lg">Primary lg</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="danger">Danger</Button>
          <Button icon="🚀">With icon</Button>
        </Row>
      </Section>

      <Section>
        <Heading>Icon Buttons</Heading>
        <Row>
          <IconButton size="xs" variant="ghost" aria-label="menu">
            ☰
          </IconButton>
          <IconButton size="sm" variant="ghost" aria-label="bell">
            🔔
          </IconButton>
          <IconButton size="md" variant="ghost" aria-label="user">
            👤
          </IconButton>
          <IconButton size="sm" variant="primary" aria-label="ok">
            ✓
          </IconButton>
          <IconButton size="sm" variant="outline" aria-label="info">
            i
          </IconButton>
          <IconButton size="sm" variant="ghost" aria-label="disabled" disabled>
            ×
          </IconButton>
        </Row>
      </Section>

      <Section>
        <Heading>Badges</Heading>
        <Row>
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="accent">Accent</Badge>
        </Row>
      </Section>

      <Section>
        <Heading>Text Fields</Heading>
        <Grid>
          <TextField id="tf1" label="Label" placeholder="Placeholder" />
          <TextField id="tf2" label="With helper" placeholder="Search..." helperText="Helpful hint" />
          <TextField id="tf3" label="Error" placeholder="Type..." error helperText="This field is required" />
          <TextField id="tf4" type="password" label="Password" placeholder="••••••••" />
          <TextField id="tf5" type="number" label="Quantity" placeholder="100" />
        </Grid>
      </Section>

      <Section>
        <Heading>Selects</Heading>
        <Row>
          <Select id="sel1" label="Asset Class" defaultValue="all" style={{ minWidth: 220 }}>
            <option value="all">All</option>
            <option value="equities">Equities</option>
            <option value="crypto">Crypto</option>
            <option value="fx">FX</option>
          </Select>
          <Select id="sel2" label="Order Type" defaultValue="market" style={{ minWidth: 220 }}>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
          </Select>
        </Row>
      </Section>

      <Section>
        <Heading>Toggle</Heading>
        <Row>
          <Toggle checked={checked} onChange={(event) => setChecked(event.target.checked)} label="Realtime updates" />
          <Toggle checked readOnly label="Read-only ON" />
          <Toggle checked={false} readOnly label="Read-only OFF" />
        </Row>
      </Section>

      <Section>
        <Heading>Menu Links</Heading>
        <Row>
          <MenuLink href="#" label="Dashboard" icon={<span>🏠</span>} data-active="true" />
          <MenuLink href="#" label="Markets" icon={<span>📈</span>} />
          <MenuLink href="#" label="Orders" icon={<span>🧾</span>} />
        </Row>
      </Section>

      <Section>
        <Heading>Cards</Heading>
        <Grid>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Card Title</CardTitle>
                <CardSubtitle>Optional subtitle text</CardSubtitle>
              </div>
              <Button size="sm" variant="outline">
                Action
              </Button>
            </CardHeader>
            <CardBody>
              <PlaceholderCard />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
            </CardHeader>
            <CardBody>
              <PlaceholderCopy>
                Use Card, CardHeader, CardTitle, CardSubtitle, and CardBody to compose.
              </PlaceholderCopy>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      <Section>
        <Heading>Stat Blocks</Heading>
        <Grid>
          <StatBlock label="Equity" value="$124,532" trend="+2.1%" trendDirection="up" meta="Today" />
          <StatBlock label="PnL (Daily)" value="+$1,432" trend="+1.16%" trendDirection="up" />
          <StatBlock label="Open Positions" value="8" meta="3 green / 5 red" />
          <StatBlock label="Orders (Today)" value="24" trend="-3" trendDirection="down" />
        </Grid>
      </Section>

      <Section>
        <Heading>Color Tokens</Heading>
        <SwatchGrid>
          {colorSwatches.length > 0 ? (
            colorSwatches.map(({ name, value }) => (
              <Swatch key={name}>
                <ColorBox $color={value} />
                <Label>
                  <div>{name}</div>
                  <span className="value">{value}</span>
                </Label>
              </Swatch>
            ))
          ) : (
            <EmptySwatchNotice>Add palette colors to show swatches</EmptySwatchNotice>
          )}
        </SwatchGrid>
      </Section>
    </Page>
  );
};

export default UiGalleryPage;
