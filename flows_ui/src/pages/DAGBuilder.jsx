import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import TaskNode from '../components/TaskNode';
import TaskConfigForm from '../components/TaskConfigForm';
import { useDAGStore } from '../stores/dagStore';

const nodeTypes = {
  task: TaskNode,
};

function DAGBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saveDAG } = useDAGStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [dagConfig, setDagConfig] = useState({
    name: '',
    description: '',
    schedule: '',
    startDate: '',
  });

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsConfigOpen(true);
  }, []);

  const handleSave = async () => {
    const dagData = {
      ...dagConfig,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type || 'success',
      })),
    };

    try {
      await saveDAG(dagData);
      navigate('/dags');
    } catch (error) {
      console.error('Error saving DAG:', error);
    }
  };

  const addTask = (type) => {
    const newNode = {
      id: `task-${nodes.length + 1}`,
      type: 'task',
      position: { x: 100, y: 100 },
      data: { type, label: `Task ${nodes.length + 1}` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">
          {id ? 'Edit DAG' : 'Create New DAG'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save DAG
        </Button>
      </Box>

      <Paper sx={{ flexGrow: 1, height: 'calc(100vh - 200px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Paper>

      <Dialog
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure Task</DialogTitle>
        <DialogContent>
          {selectedNode && (
            <TaskConfigForm
              node={selectedNode}
              onUpdate={(data) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === selectedNode.id
                      ? { ...node, data: { ...node.data, ...data } }
                      : node
                  )
                );
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfigOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DAGBuilder; 