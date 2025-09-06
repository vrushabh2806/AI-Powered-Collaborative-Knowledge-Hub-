import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  History,
  Person,
  AccessTime,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { documentService } from '../services/documentService';
import { useAuth } from '../context/AuthContext';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const { data: document, isLoading, error } = useQuery(
    ['document', id],
    () => documentService.getDocument(id)
  );

  const { data: versionsData, isLoading: versionsLoading } = useQuery(
    ['documentVersions', id],
    () => documentService.getDocumentVersions(id),
    { enabled: versionsOpen }
  );

  const deleteMutation = useMutation(
    () => documentService.deleteDocument(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        navigate('/dashboard');
      }
    }
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/documents/${id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate();
    }
    handleMenuClose();
  };

  const handleVersionsOpen = () => {
    setVersionsOpen(true);
    handleMenuClose();
  };

  const canEditOrDelete = () => {
    return user?.role === 'admin' || document?.createdBy._id === user?.id;
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load document
        </Alert>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          Document not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {document.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} color="text.secondary">
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">
                  {document.createdBy.name}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">
                  {format(new Date(document.updatedAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {canEditOrDelete() && (
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {document.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {/* Summary */}
        {document.summary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body1">
                {document.summary}
              </Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {document.content}
          </Typography>
        </Box>

        {/* Last Edited Info */}
        {document.lastEditedBy && (
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Last edited by {document.lastEditedBy.name} on{' '}
              {format(new Date(document.updatedAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Document Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleVersionsOpen}>
          <History sx={{ mr: 1 }} />
          View History
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Versions Dialog */}
      <Dialog
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Document History</DialogTitle>
        <DialogContent>
          {versionsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {/* Current Version */}
              <ListItem>
                <ListItemText
                  primary="Current Version"
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {document.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(document.updatedAt), 'MMM dd, yyyy HH:mm')} - 
                        {document.lastEditedBy ? document.lastEditedBy.name : document.createdBy.name}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
              
              {/* Previous Versions */}
              {versionsData?.versions?.map((version, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`Version ${versionsData.versions.length - index}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {version.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(version.editedAt), 'MMM dd, yyyy HH:mm')} - 
                            {version.editedBy?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < versionsData.versions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              
              {(!versionsData?.versions || versionsData.versions.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No previous versions found
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentView;
