import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';

const LeadPoolLeads = ({ leadPoolId }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [agents, setAgents] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    leadsPerPage: 20
  });

  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, [leadPoolId, pagination.currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.leadPools.getLeads(leadPoolId, {
        page: pagination.currentPage,
        limit: pagination.leadsPerPage
      });
      
      // Ensure leads is always an array
      const poolLeads = Array.isArray(response.data) ? response.data : 
                        (response.data && Array.isArray(response.data.leads)) ? response.data.leads : 
                        [];
      
      // Calculate pagination
      const totalLeads = response.meta?.total || poolLeads.length;
      const totalPages = Math.ceil(totalLeads / pagination.leadsPerPage);
      
      // Update pagination state
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalLeads
      }));
      
      setLeads(poolLeads);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leads');
      console.error('Error fetching leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await apiService.callCenter.agents.getAll();
      setAgents(response.data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleImportLeads = async () => {
    if (!importFile) return;

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      await apiService.leadPools.importLeads(leadPoolId, formData);
      setOpenImportDialog(false);
      setImportFile(null);
      fetchLeads();
    } catch (err) {
      setError('Failed to import leads');
      console.error('Error importing leads:', err);
    }
  };

  const handleAssignLead = async (leadId, agentId) => {
    try {
      await apiService.leads.assignToAgent(leadId, agentId);
      setOpenAssignDialog(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      setError('Failed to assign lead');
      console.error('Error assigning lead:', err);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await apiService.leads.updateStatus(leadId, newStatus);
      fetchLeads();
    } catch (err) {
      setError('Failed to update lead status');
      console.error('Error updating lead status:', err);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h6">Leads</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenImportDialog(true)}
              >
                Import Leads
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Agent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{`${lead.first_name} ${lead.last_name}`}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="NEW">New</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="FAILED">Failed</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>{lead.assigned_agent?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Tooltip title="Assign Lead">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLead(lead);
                            setOpenAssignDialog(true);
                          }}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Lead">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Lead">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.currentPage ? 'contained' : 'outlined'}
                onClick={() => handlePageChange(page)}
                sx={{ mx: 0.5 }}
              >
                {page}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)}>
        <DialogTitle>Import Leads</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files[0])}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Cancel</Button>
          <Button onClick={handleImportLeads} variant="contained" color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
        <DialogTitle>Assign Lead</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Agent"
            onChange={(e) => handleAssignLead(selectedLead?.id, e.target.value)}
            sx={{ mt: 2 }}
          >
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadPoolLeads; 