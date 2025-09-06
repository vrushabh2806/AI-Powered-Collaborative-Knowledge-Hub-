import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  Send,
  AutoAwesome,
  Person,
  Source
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { qaService } from '../services/qaService';
import { useNavigate } from 'react-router-dom';

const QAPage = () => {
  const navigate = useNavigate();
  const [qaHistory, setQaHistory] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const askMutation = useMutation(qaService.askQuestion, {
    onSuccess: (data) => {
      setQaHistory(prev => [data, ...prev]);
      reset();
    }
  });

  const onSubmit = async (data) => {
    askMutation.mutate(data.question);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Q&A Assistant
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Ask questions about your team's documents and get AI-powered answers
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Question Input */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ask a Question
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="What would you like to know?"
                placeholder="e.g., What are the main points about machine learning in our documents?"
                {...register('question', {
                  required: 'Please enter a question',
                  minLength: {
                    value: 10,
                    message: 'Question must be at least 10 characters'
                  }
                })}
                error={!!errors.question}
                helperText={errors.question?.message}
                sx={{ mb: 2 }}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  The AI will search through all your team's documents to provide relevant answers
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Send />}
                  disabled={askMutation.isLoading}
                >
                  {askMutation.isLoading ? 'Asking...' : 'Ask Question'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Q&A History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Q&A History
            </Typography>
            
            {askMutation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {askMutation.error?.response?.data?.message || 'Failed to process question'}
              </Alert>
            )}

            {askMutation.isLoading && (
              <Box display="flex" alignItems="center" gap={2} p={2}>
                <CircularProgress size={24} />
                <Typography>AI is thinking...</Typography>
              </Box>
            )}

            {qaHistory.length === 0 ? (
              <Box textAlign="center" py={4}>
                <AutoAwesome sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No questions asked yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by asking a question about your team's documents
                </Typography>
              </Box>
            ) : (
              <List>
                {qaHistory.map((qa, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      {/* Question */}
                      <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Person sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle2" color="primary">
                              Your Question
                            </Typography>
                          </Box>
                          <Typography variant="body1">
                            {qa.question}
                          </Typography>
                        </CardContent>
                      </Card>

                      {/* Answer */}
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <AutoAwesome sx={{ mr: 1, color: 'secondary.main' }} />
                            <Typography variant="subtitle2" color="secondary">
                              AI Answer
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                            {qa.answer}
                          </Typography>

                          {/* Sources */}
                          {qa.sources && qa.sources.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                <Source sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                Sources:
                              </Typography>
                              <List dense>
                                {qa.sources.map((source, sourceIndex) => (
                                  <ListItem key={sourceIndex} sx={{ py: 0 }}>
                                    <ListItemAvatar>
                                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                        {sourceIndex + 1}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Button
                                          variant="text"
                                          onClick={() => navigate(`/documents/${source.id}`)}
                                          sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start' }}
                                        >
                                          {source.title}
                                        </Button>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography variant="caption" display="block">
                                            {source.summary}
                                          </Typography>
                                          <Box sx={{ mt: 0.5 }}>
                                            {source.tags.slice(0, 3).map((tag, tagIndex) => (
                                              <Chip
                                                key={tagIndex}
                                                label={tag}
                                                size="small"
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                              />
                                            ))}
                                          </Box>
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </ListItem>
                    {index < qaHistory.length - 1 && <Divider sx={{ my: 2 }} />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QAPage;
