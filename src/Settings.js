import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/system';
import Badge from '@mui/material/Badge';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const SettingsWrapper = styled('div')(({ theme }) => ({
    padding: '24px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
}));

const Settings = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user settings
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user/settings');
                if (!response.ok) {
                    throw new Error('Failed to fetch user settings');
                }
                const data = await response.json();
                setUserData(data);
                // You can set the data in state here if needed
            } catch (error) {
                setError(error.message); // Update state with the error message
                console.error("Error fetching user data:", error);

            }
        };

        fetchUserData(); // Call to fetch user settings

        // Update document title on initial load
        document.title = `Settings - ${new Date().toLocaleTimeString()}`;

        // Cleanup function to prevent memory leak
        return () => {
            // If you plan on using an interval, clean it up here
        };
    }, []); 

    return (
        <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
                <SettingsWrapper>
                    {/* Notification Badge */}
                    <Grid container justifyContent="flex-end" alignItems="center">
                        <Badge badgeContent={4} color="primary">
                            <NotificationsActiveIcon fontSize="large" />
                        </Badge>
                    </Grid>

                    <Typography variant="h4" gutterBottom>
                        Settings
                    </Typography>
                    <Divider />

                    {/* User Profile Section */}
                    <Typography variant="h6" sx={{ marginTop: '24px' }}>
                        User Profile
                    </Typography>
                    <Typography variant="body1" sx={{ marginTop: '8px' }}>
                        Full Name (Dynamic or Placeholder)
                    </Typography>

                    {/* Privacy Section */}
                    <Typography variant="h6" sx={{ marginTop: '24px' }}>
                        Privacy Preferences
                    </Typography>
                    <Typography variant="body1" sx={{ marginTop: '8px' }}>
                        Email (Dynamic or Placeholder)
                    </Typography>
                </SettingsWrapper>
            </Grid>
        </Grid>
    );
}; 


export default Settings;