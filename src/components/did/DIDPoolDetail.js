import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import LeadPoolLeads from '../leads/LeadPoolLeads';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const DIDPoolDetail = () => {
  const { id } = useParams();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPoolDetails();
  }, [id]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.didPools.getById(id);
      setPool(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch DID pool details');
      console.error('Error fetching DID pool:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!pool) return <Alert severity="info">DID pool not found</Alert>;

  return (
    <Box>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs>
              <Typography variant="h5">{pool.name}</Typography>
              <Typography color="textSecondary">
                {pool.description || 'No description provided'}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => {/* TODO: Implement settings */}}
              >
                Settings
              </Button>
            </Grid>
          </Grid>

          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<PhoneIcon />}
              label="DIDs"
              iconPosition="start"
            />
            <Tab
              icon={<UploadIcon />}
              label="Leads"
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  DIDs in Pool
                </Typography>
                {/* TODO: Implement DID list component */}
                <Typography color="textSecondary">
                  DID list component will be implemented here
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <LeadPoolLeads leadPoolId={id} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DIDPoolDetail; 