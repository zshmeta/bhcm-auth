import { Button, Card, Text } from "@repo/ui";
import styles from "./page.module.css";

export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8081";
  const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:5173";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Text size="xxl" weight="bold">BHC Markets Documentation</Text>
        <Text>
          Welcome to the developer documentation for BHC Markets.
        </Text>

        <Card>
          <Text size="xl" weight="bold">REST API</Text>
          <Text>Base URL: <code>{API_BASE}</code></Text>
          <br />
          <ul>
            <li><code>POST /auth/login</code> - Get Access Token</li>
            <li><code>GET /positions?userId=UUID</code> - Get User Positions (Auth Required)</li>
            <li><code>POST /orders</code> - Place Limit/Market Order</li>
          </ul>
        </Card>

        <Card>
          <Text size="xl" weight="bold">WebSocket API</Text>
          <Text>URL: <code>{WS_URL}</code></Text>
          <br />
          <ul>
            <li>Event: <code>subscribe</code> - Listen to symbol updates</li>
            <li>Event: <code>price_update</code> - Receive live market data</li>
          </ul>
        </Card>

        <div style={{ marginTop: 20 }}>
          <Button onClick={() => window.open(PLATFORM_URL, '_blank')}>
            Go to Exchange
          </Button>
        </div>
      </main>
    </div>
  );
}
