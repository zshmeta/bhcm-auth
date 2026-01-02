import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Card, CardBody, CardHeader, TextField } from "@repo/ui";

type AdminUserRow = {
    id: string;
    userId: string;
    email: string;
    currency: string;
    balance: string;
    locked: string;
    status: string;
};

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    color: #888;
    font-weight: 500;
  }
`;

const ActionButton = styled(Button)`
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e222d;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const API_BASE = (window as unknown as { __API_BASE?: string }).__API_BASE || 'http://localhost:8080';

export const AdminPage = () => {
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (res.ok) {
                setUsers((await res.json()) as AdminUserRow[]);
            }
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBalanceUpdate = async (type: 'deposit' | 'withdraw') => {
        if (!selectedUser || !amount) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/admin/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userId: selectedUser.userId,
                    amount: parseFloat(amount),
                    type
                })
            });

            if (res.ok) {
                setSelectedUser(null);
                setAmount('');
                fetchUsers();
            } else {
                alert('Failed to update balance');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <Card>
                <CardHeader>
                    <h2>User Management</h2>
                </CardHeader>
                <CardBody>
                    <Table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Currency</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>{user.currency}</td>
                                    <td>{parseFloat(user.balance).toFixed(2)}</td>
                                    <td>{user.status}</td>
                                    <td>
                                        <ActionButton onClick={() => setSelectedUser(user)}>
                                            Manage Funds
                                        </ActionButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            {selectedUser && (
                <ModalOverlay onClick={() => setSelectedUser(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h3>Manage Funds: {selectedUser.email}</h3>
                        <div style={{ margin: '1.5rem 0' }}>
                            <TextField
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button variant="subtle" onClick={() => setSelectedUser(null)}>Cancel</Button>
                            <Button
                                variant="danger"
                                onClick={() => handleBalanceUpdate('withdraw')}
                                disabled={loading}
                            >
                                Withdraw
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleBalanceUpdate('deposit')}
                                disabled={loading}
                            >
                                Deposit
                            </Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default AdminPage;
