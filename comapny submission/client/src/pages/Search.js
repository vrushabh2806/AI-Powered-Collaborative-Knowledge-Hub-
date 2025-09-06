import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome,
  Person,
  AccessTime
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { searchService } from '../services/searchService';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);

  const { data: tagsData } = useQuery(
    'allTags',
    searchService.getAllTags
  );

  const { data: textSearchData, isLoading: textLoading, refetch: refetchText } = useQuery(
    ['textSearch', searchQuery, page],
    () => searchService.textSearch(searchQuery, page, 10),
    { enabled: false }
  );

  const { data: semanticSearchData, isLoading: semanticLoading, refetch: refetchSemantic } = useQuery(
    ['semanticSearch', searchQuery, page],
    () => searchService.semanticSearch(searchQuery, page, 10),
    { enabled: false }
  );

  const { data: tagSearchData, isLoading: tagLoading, refetch: refetchTag } = useQuery(
    ['tagSearch', selectedTags, page],
    () => searchService.tagSearch(selectedTags, page, 10),
    { enabled: false }
  );

  const handleSearch = () => {
    setPage(1);
    if (searchType === 0) {
      refetchText();
    } else if (searchType === 1) {
      refetchSemantic();
    } else if (searchType === 2) {
      refetchTag();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTagChange = (event) => {
    setSelectedTags(event.target.value);
  };

  const getCurrentData = () => {
    switch (searchType) {
      case 0:
        return textSearchData;
      case 1:
        return semanticSearchData;
      case 2:
        return tagSearchData;
      default:
        return null;
    }
  };

  const getCurrentLoading = () => {
    switch (searchType) {
      case 0:
        return textLoading;
      case 1:
        return semanticLoading;
      case 2:
        return tagLoading;
      default:
        return false;
    }
  };

  const currentData = getCurrentData();
  const currentLoading = getCurrentLoading();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search Documents
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find documents using text search, AI-powered semantic search, or tag filtering
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs
          value={searchType}
          onChange={(e, newValue) => setSearchType(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Text Search" />
          <Tab label="AI Semantic Search" icon={<AutoAwesome />} />
          <Tab label="Tag Search" />
        </Tabs>

        {searchType === 0 && (
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              label="Search documents"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
          </Box>
        )}

        {searchType === 1 && (
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              label="Ask AI to find relevant documents"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'documents about machine learning algorithms'"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AutoAwesome />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              startIcon={<AutoAwesome />}
            >
              AI Search
            </Button>
          </Box>
        )}

        {searchType === 2 && (
          <Box display="flex" gap={2} alignItems="center">
            <FormControl fullWidth>
              <InputLabel>Select Tags</InputLabel>
              <Select
                multiple
                value={selectedTags}
                onChange={handleTagChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {tagsData?.tags?.map((tag) => (
                  <MenuItem key={tag._id} value={tag._id}>
                    {tag._id} ({tag.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={selectedTags.length === 0}
            >
              Filter
            </Button>
          </Box>
        )}
      </Paper>

      {/* Search Results */}
      {currentData && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Search Results
              {currentData.total && ` (${currentData.total} found)`}
            </Typography>
            {searchType === 1 && currentData.semanticAnalysis && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesome />}
                onClick={() => alert(currentData.semanticAnalysis)}
              >
                View AI Analysis
              </Button>
            )}
          </Box>

          {currentLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : currentData.documents?.length === 0 ? (
            <Alert severity="info">
              No documents found matching your search criteria.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {currentData.documents?.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {doc.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {doc.summary || doc.content.substring(0, 150) + '...'}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {doc.tags.length > 3 && (
                          <Chip
                            label={`+${doc.tags.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
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
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {currentData.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                sx={{ mr: 1 }}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ alignSelf: 'center', mx: 2 }}>
                Page {page} of {currentData.totalPages}
              </Typography>
              <Button
                disabled={page === currentData.totalPages}
                onClick={() => setPage(page + 1)}
                sx={{ ml: 1 }}
              >
                Next
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default Search;
