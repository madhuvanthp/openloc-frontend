import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Alert,
    CircularProgress,
    Avatar
} from '@mui/material';
import {
    UserPlus,
    Check,
    X,
    Users,
    Bell,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

interface Friend {
    id: string;
    username: string;
}

interface FriendRequest {
    friendship_id: string;
    from_username: string;
    created_at: string;
}

const SocialCenter: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [searchUsername, setSearchUsername] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, [token]);

    const fetchFriends = async () => {
        try {
            const res = await fetch(`${API_BASE}/social/friends`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFriends(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch friends", err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_BASE}/social/requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched requests for user:", data);
                setRequests(data || []);
            } else {
                const errorData = await res.json();
                console.error("Error fetching requests:", errorData);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/social/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ target_username: searchUsername })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to send request');
            }

            setSuccess(`Friend request sent to ${searchUsername}`);
            setSearchUsername('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (friendshipId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`${API_BASE}/social/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ friendship_id: friendshipId, action })
            });

            if (res.ok) {
                setRequests(requests.filter(r => r.friendship_id !== friendshipId));
                if (action === 'accept') {
                    fetchFriends();
                    setSuccess("Friendship accepted!");
                }
            }
        } catch (err) {
            setError("Failed to respond to request");
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    borderRadius: 4,
                    bgcolor: 'rgba(30, 41, 59, 1.0)', // Solid background to avoid transparency issues
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, val) => setTabValue(val)}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 },
                            '& .Mui-selected': { color: '#3b82f6' },
                            '& .MuiTabs-indicator': { bgcolor: '#3b82f6' }
                        }}
                    >
                        <Tab icon={<Users size={20} />} label="Friends" iconPosition="start" />
                        <Tab
                            icon={<Bell size={20} />}
                            label={`Requests ${requests.length > 0 ? `(${requests.length})` : ''}`}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                <Box sx={{ p: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

                    {tabValue === 0 && (
                        <Box>
                            <Box component="form" onSubmit={handleSendRequest} sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Enter username to add..."
                                    value={searchUsername}
                                    onChange={(e) => setSearchUsername(e.target.value)}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <Search size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            color: 'white',
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !searchUsername}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UserPlus size={18} />}
                                    sx={{ borderRadius: 2, textTransform: 'none', px: 3, bgcolor: '#3b82f6' }}
                                >
                                    Add
                                </Button>
                            </Box>

                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>Current Friends</Typography>
                            <List>
                                {friends.length === 0 ? (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 4 }}>No friends yet. Add someone to start sharing!</Typography>
                                ) : (
                                    friends.map((friend) => (
                                        <React.Fragment key={friend.id}>
                                            <ListItem sx={{ py: 2 }}>
                                                <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>{friend.username[0].toUpperCase()}</Avatar>
                                                <ListItemText
                                                    primary={friend.username}
                                                    primaryTypographyProps={{ fontWeight: 600, color: 'white' }}
                                                />
                                            </ListItem>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                        </React.Fragment>
                                    ))
                                )}
                            </List>
                        </Box>
                    )}

                    {tabValue === 1 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>Pending Requests</Typography>
                            <List>
                                {requests.length === 0 ? (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 4 }}>No pending requests.</Typography>
                                ) : (
                                    requests.map((req) => (
                                        <React.Fragment key={req.friendship_id}>
                                            <ListItem sx={{ py: 2 }}>
                                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', mr: 2 }}>{req.from_username[0].toUpperCase()}</Avatar>
                                                <ListItemText
                                                    primary={req.from_username}
                                                    secondary={`Sent ${new Date(req.created_at).toLocaleDateString()}`}
                                                    primaryTypographyProps={{ fontWeight: 600, color: 'white' }}
                                                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.4)' }}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        onClick={() => handleRespond(req.friendship_id, 'accept')}
                                                        sx={{ color: '#10b981', mr: 1 }}
                                                    >
                                                        <Check size={20} />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleRespond(req.friendship_id, 'reject')}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <X size={20} />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                        </React.Fragment>
                                    ))
                                )}
                            </List>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default SocialCenter;
