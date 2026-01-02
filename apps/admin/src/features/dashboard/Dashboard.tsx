import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Card, Text, Input } from '@repo/ui';

const Container = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
  
  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #f9fafb;
    font-weight: 600;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: 8px;
`;

type UserAccount = {
    userId: string;
    email: string;
    balance: string;
    currency: string;
    status: string;
    locked: string;
};

export const Dashboard = () => {
    const [accounts, setAccounts] = useState<UserAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
    const [amount, setAmount] = useState('');
    const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
    const navigate = useNavigate();

    const apiBase = (window as unknown as { __API_BASE?: string }).__API_BASE || 'http://localhost:8080';

    const token = localStorage.getItem('admin_token');

    const fetchAccounts = async () => {
        try {
            const res = await fetch(`${apiBase}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                navigate('/login');
                return;
            }
            const data = await res.json();
            setAccounts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAccounts();
    }, [token, navigate]);

    const handleAction = (user: UserAccount, type: 'deposit' | 'withdraw') => {
        setSelectedUser(user);
        setActionType(type);
        setAmount('');
    };

    const submitAction = async () => {
        if (!selectedUser || !amount) return;
        try {
            const res = await fetch(`${apiBase}/admin/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: selectedUser.userId,
                    amount: parseFloat(amount),
                    type: actionType
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Action failed');
                return;
            }

            // Refresh
            fetchAccounts();
            setSelectedUser(null);
        } catch (err) {
            alert('Network error');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Container>
            <Header>
                <Text size="xxl" weight="bold">User Management</Text>
                <Button onClick={() => {
                    localStorage.removeItem('admin_token');
                    navigate('/login');
                }}>Logout</Button>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Balance (Free)</th>
                        <th>Locked</th>
                        <th>Currency</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map(acc => (
                        <tr key={acc.userId}>
                            <td>{acc.email}</td>
                            <td>{acc.balance}</td>
                            <td>{acc.locked}</td>
                            <td>{acc.currency}</td>
                            <td>{acc.status}</td>
                            <td>
                                <ActionGroup>
                                    <Button size="sm" variant="secondary" onClick={() => handleAction(acc, 'deposit')}>Deposit</Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleAction(acc, 'withdraw')}>Withdraw</Button>
                                </ActionGroup>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {selectedUser && (
                <ModalOverlay onClick={() => setSelectedUser(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <Text size="lg" weight="bold">{actionType.toUpperCase()} - {selectedUser.email}</Text>
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                        />
                        <ActionGroup>
                            <Button onClick={submitAction}>Confirm</Button>
                            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
                        </ActionGroup>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};
