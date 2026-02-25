import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
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
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', width: '100%' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, val) => setTabValue(val)}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        width: '100%',
                        '& .MuiTab-root': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 700,
                            minHeight: 64,
                            fontSize: '0.85rem',
                            letterSpacing: '0.1em',
                            transition: 'all 0.2s',
                            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.02)' }
                        },
                        '& .Mui-selected': { color: '#3b82f6 !important' },
                        '& .MuiTabs-indicator': {
                            bgcolor: '#3b82f6',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        },
                        '& .MuiTabs-flexContainer': {
                            width: '100%'
                        }
                    }}
                >
                    <Tab icon={<Users size={20} />} label="FRIENDS" iconPosition="start" />
                    <Tab
                        icon={<Bell size={20} />}
                        label={`REQUESTS ${requests.length > 0 ? `(${requests.length})` : ''}`}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
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

                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'white', opacity: 0.9, letterSpacing: '0.05em' }}>
                            CURRENT FRIENDS
                        </Typography>
                        <List disablePadding>
                            {friends.length === 0 ? (
                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 4 }}>No friends yet. Add someone to start sharing!</Typography>
                            ) : (
                                friends.map((friend) => (
                                    <React.Fragment key={friend.id}>
                                        <ListItem sx={{ py: 1.5, px: 0 }}>
                                            <Avatar sx={{ bgcolor: '#3b82f6', mr: 2, width: 40, height: 40 }}>{friend.username[0].toUpperCase()}</Avatar>
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
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'white', opacity: 0.9, letterSpacing: '0.05em' }}>
                            PENDING REQUESTS
                        </Typography>
                        <List disablePadding>
                            {requests.length === 0 ? (
                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 4 }}>No pending requests.</Typography>
                            ) : (
                                requests.map((req) => (
                                    <React.Fragment key={req.friendship_id}>
                                        <ListItem sx={{ py: 1.5, px: 0 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', mr: 2, width: 40, height: 40 }}>{req.from_username[0].toUpperCase()}</Avatar>
                                            <ListItemText
                                                primary={req.from_username}
                                                secondary={`Sent ${new Date(req.created_at).toLocaleDateString()}`}
                                                primaryTypographyProps={{ fontWeight: 600, color: 'white' }}
                                                secondaryTypographyProps={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}
                                            />
                                            <ListItemSecondaryAction sx={{ right: 0 }}>
                                                <IconButton
                                                    onClick={() => handleRespond(req.friendship_id, 'accept')}
                                                    sx={{ color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' }, mr: 1 }}
                                                    size="small"
                                                >
                                                    <Check size={18} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleRespond(req.friendship_id, 'reject')}
                                                    sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                                                    size="small"
                                                >
                                                    <X size={18} />
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
        </Box>
    );
};

export default SocialCenter;
