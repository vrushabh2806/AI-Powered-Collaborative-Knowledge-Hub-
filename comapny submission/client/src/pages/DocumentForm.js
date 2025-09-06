import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Tag,
  Summarize
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { documentService } from '../services/documentService';

const DocumentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      content: '',
      tags: []
    }
  });

  const content = watch('content');

  // Fetch document if editing
  const { data: document, isLoading } = useQuery(
    ['document', id],
    () => documentService.getDocument(id),
    { enabled: isEdit }
  );

  // Set form values when document is loaded
  useEffect(() => {
    if (document) {
      setValue('title', document.title);
      setValue('content', document.content);
      setTags(document.tags || []);
    }
  }, [document, setValue]);

  const createMutation = useMutation(documentService.createDocument, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('documents');
      navigate(`/documents/${data._id}`);
    }
  });

  const updateMutation = useMutation(
    (data) => documentService.updateDocument(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries(['document', id]);
        navigate(`/documents/${data._id}`);
      }
    }
  );

  const generateSummaryMutation = useMutation(
    () => documentService.generateSummary(id),
    {
      onSuccess: (data) => {
        setValue('summary', data.summary);
      }
    }
  );

  const generateTagsMutation = useMutation(
    () => documentService.generateTags(id),
    {
      onSuccess: (data) => {
        setTags(data.tags);
      }
    }
  );

  const onSubmit = async (data) => {
    const documentData = {
      ...data,
      tags
    };

    if (isEdit) {
      updateMutation.mutate(documentData);
    } else {
      createMutation.mutate(documentData);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      alert('Please add some content first');
      return;
    }
    setAiLoading(true);
    try {
      if (isEdit) {
        await generateSummaryMutation.mutateAsync();
      } else {
        // For new documents, we'll generate summary on save
        alert('Summary will be generated automatically when you save the document');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!content.trim()) {
      alert('Please add some content first');
      return;
    }
    setAiLoading(true);
    try {
      if (isEdit) {
        await generateTagsMutation.mutateAsync();
      } else {
        // For new documents, we'll generate tags on save
        alert('Tags will be generated automatically when you save the document');
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    } finally {
      setAiLoading(false);
    }
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
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Document' : 'Create New Document'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 1,
                message: 'Title must not be empty'
              }
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            fullWidth
            label="Content"
            margin="normal"
            multiline
            rows={12}
            {...register('content', {
              required: 'Content is required',
              minLength: {
                value: 1,
                message: 'Content must not be empty'
              }
            })}
            error={!!errors.content}
            helperText={errors.content?.message}
          />

          {/* Tags Section */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TextField
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
              <Tooltip title="Generate tags with AI">
                <IconButton
                  onClick={handleGenerateTags}
                  disabled={aiLoading || !content.trim()}
                  color="primary"
                >
                  <Tag />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>

          {/* AI Actions */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Features
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Summarize />}
                onClick={handleGenerateSummary}
                disabled={aiLoading || !content.trim()}
              >
                {aiLoading ? 'Generating...' : 'Generate Summary'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Tag />}
                onClick={handleGenerateTags}
                disabled={aiLoading || !content.trim()}
              >
                {aiLoading ? 'Generating...' : 'Generate Tags'}
              </Button>
            </Box>
          </Box>

          {/* Error Messages */}
          {(createMutation.error || updateMutation.error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createMutation.error?.response?.data?.message || 
               updateMutation.error?.response?.data?.message || 
               'An error occurred'}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : isEdit
                ? 'Update Document'
                : 'Create Document'
              }
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DocumentForm;
