// src/components/projects/ProjectList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Grid,
    Box,
    CircularProgress,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';
import { getProjects, deleteProject } from '../../services/projectService';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteProject(projectToDelete.id);
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const handleCreateProject = () => {
        navigate('/projects/new', {
            state: {
                name: newProjectName,
                description: newProjectDescription
            }
        });
        setNewProjectDialogOpen(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    My Projects
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setNewProjectDialogOpen(true)}
                >
                    New Project
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : projects.length > 0 ? (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Project Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Last Modified</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell component="th" scope="row">
                                        <Link
                                            to={`/projects/${project.id}`}
                                            style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                                        >
                                            {project.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{project.description}</TableCell>
                                    <TableCell>{moment(project.createdDate).format('MMM D, YYYY')}</TableCell>
                                    <TableCell>{moment(project.lastModifiedDate).format('MMM D, YYYY')}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            component={Link}
                                            to={`/projects/${project.id}`}
                                            title="Edit Project"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/projects/copy/${project.id}`}
                                            title="Duplicate Project"
                                        >
                                            <FileCopyIcon />
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/reports/${project.id}`}
                                            title="Generate PDF Report"
                                        >
                                            <PictureAsPdfIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteClick(project)}
                                            title="Delete Project"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" gutterBottom>
                        You don't have any projects yet.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setNewProjectDialogOpen(true)}
                        sx={{ mt: 2 }}
                    >
                        Create Your First Project
                    </Button>
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* New Project Dialog */}
            <Dialog
                open={newProjectDialogOpen}
                onClose={() => setNewProjectDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Create New Project</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Project Name"
                        fullWidth
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewProjectDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateProject}
                        color="primary"
                        disabled={!newProjectName.trim()}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ProjectList;