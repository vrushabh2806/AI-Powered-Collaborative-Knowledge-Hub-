import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Person,
  AccessTime,
  AutoAwesome
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { documentService } from '../services/documentService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTag, setSelectedTag] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const { data: documentsData, isLoading: documentsLoading, error: documentsError } = useQuery(
    ['documents', selectedTag],
    () => documentService.getDocuments(1, 10, selectedTag),
    { refetchInterval: 30000 }
  );

  const { data: activityData, isLoading: activityLoading } = useQuery(
    'recentActivity',
    documentService.getRecentActivity,
    { refetchInterval: 30000 }
  );

  const handleMenuOpen = (event, doc) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handleEdit = () => {
    navigate(`/documents/${selectedDoc._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(selectedDoc._id);
        // Refetch documents
        window.location.reload();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/documents/${selectedDoc._id}`);
    handleMenuClose();
  };

  const canEditOrDelete = (doc) => {
    return user?.role === 'admin' || doc.createdBy._id === user?.id;
  };

  const getUniqueTags = () => {
    if (!documentsData?.documents) return [];
    const allTags = documentsData.documents.flatMap(doc => doc.tags);
    return [...new Set(allTags)];
  };

  if (documentsLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name}!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Documents</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/documents/new')}
              >
                New Document
              </Button>
            </Box>

            {/* Tag Filters */}
            <Box sx={{ mb: 2 }}>
              <Chip
                label="All"
                onClick={() => setSelectedTag(null)}
                color={selectedTag === null ? 'primary' : 'default'}
                sx={{ mr: 1, mb: 1 }}
              />
              {getUniqueTags().map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => setSelectedTag(tag)}
                  color={selectedTag === tag ? 'primary' : 'default'}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            {documentsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load documents
              </Alert>
            )}

            {documentsData?.documents?.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  No documents found
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/documents/new')}
                  sx={{ mt: 2 }}
                >
                  Create your first document
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {documentsData?.documents?.map((doc) => (
                  <Grid item xs={12} sm={6} key={doc._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {doc.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {doc.summary || doc.content.substring(0, 150) + '...'}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          {doc.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        <Box display="flex" alignItems="center" color="text.secondary">
                          <Person sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption">
                            {doc.createdBy.name}
                          </Typography>
                          <AccessTime sx={{ fontSize: 16, ml: 2, mr: 0.5 }} />
                          <Typography variant="caption">
                            {format(new Date(doc.updatedAt), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/documents/${doc._id}`)}>
                          View
                        </Button>
                        {canEditOrDelete(doc) && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, doc)}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recent Activity */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {activityLoading ? (
              <CircularProgress size={24} />
            ) : (
              <List>
                {activityData?.recentDocuments?.map((doc, index) => (
                  <ListItem key={index} divider={index < activityData.recentDocuments.length - 1}>
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {doc.lastEditedBy ? `Edited by ${doc.lastEditedBy.name}` : `Created by ${doc.createdBy.name}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(doc.updatedAt), 'MMM dd, HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {activityData?.recentDocuments?.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                )}
              </List>
            )}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/documents/new')}
                fullWidth
              >
                New Document
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={() => navigate('/search')}
                fullWidth
              >
                AI Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={() => navigate('/qa')}
                fullWidth
              >
                Ask AI
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Document Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Edit sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;
