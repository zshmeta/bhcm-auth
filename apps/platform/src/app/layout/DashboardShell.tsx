import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { Badge, Button, MenuLink } from "@repo/ui";

const Shell = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: ${({ theme }) => `${theme.layout.sidebarWidth} minmax(0, 1fr)`};
`;

const Sidebar = styled.aside`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: linear-gradient(140deg, rgba(12, 20, 42, 0.95), rgba(9, 14, 34, 0.75));
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const BrandMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.gradients.primary};
  font-weight: ${({ theme }) => theme.typography.weightSemiBold};
  font-size: 1.2rem;
  letter-spacing: 0.12em;
`;

const BrandLabel = styled.span`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: ${({ theme }) => theme.colors.neutral400};
`;

const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SectionLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.neutral600};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Main = styled.main`
  padding: ${({ theme }) => theme.spacing.xl};
  background: transparent;
  border-left: 1px solid ${({ theme }) => theme.colors.border.subtle};
  overflow: auto;
`;

const Content = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  width: 100%;
  margin: 0 auto;
`;

const DASHBOARD_ROOT = "/app" as const;

const menuItems = [
  { label: "Overview", to: DASHBOARD_ROOT, icon: "🏠" },
  { label: "Portfolio", to: `${DASHBOARD_ROOT}/portfolio`, icon: "💼" },
  { label: "Markets", to: `${DASHBOARD_ROOT}/markets`, icon: "📈" },
  { label: "Orders", to: `${DASHBOARD_ROOT}/orders`, icon: "🧾" },
  { label: "Settings", to: `${DASHBOARD_ROOT}/settings`, icon: "⚙️" },
] as const;

export const DashboardShell = () => (
  <Shell>
    <Sidebar>
      <Brand>
        <BrandMark>BHV</BrandMark>
        <BrandLabel>Markets</BrandLabel>
      </Brand>

      <div>
        <SectionLabel>Main</SectionLabel>
        <NavSection>
          {menuItems.map((item) => (
            <MenuLink
              key={item.to}
              as={NavLink as any}
              to={item.to}
              end={item.to === DASHBOARD_ROOT}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </NavSection>
      </div>

      <SidebarFooter>
        <Badge variant="accent">Premium</Badge>
        <p>
          Upgrade your account for deeper analytics, white-labeled reporting, and advanced signals.
        </p>
        <Button variant="secondary">Upgrade Plan</Button>
      </SidebarFooter>
    </Sidebar>

    <Main>
      <Content>
        <Outlet />
      </Content>
    </Main>
  </Shell>
);

export default DashboardShell;
