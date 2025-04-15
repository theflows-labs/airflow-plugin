import { create } from 'zustand';
import axios from 'axios';
import YAML from 'yaml';

export const useDAGStore = create((set) => ({
  dags: [],
  loading: false,
  error: null,

  // Fetch all DAGs
  fetchDAGs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/dags');
      set({ dags: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Save a DAG
  saveDAG: async (dagData) => {
    set({ loading: true, error: null });
    try {
      // Save to database
      await axios.post('/api/dags', dagData);

      // Save to YAML file
      const yamlContent = YAML.stringify({
        dags: {
          [dagData.name]: {
            description: dagData.description,
            is_active: true,
            config: {
              schedule_interval: dagData.schedule,
              start_date: dagData.startDate,
              catchup: false,
              max_active_runs: 1,
              default_args: {
                owner: 'airflow',
                retries: 1,
                retry_delay: '00:05:00',
              },
            },
            tasks: dagData.nodes.reduce((acc, node) => {
              acc[node.id] = {
                type: node.type,
                is_active: true,
                config: node.data.config,
              };
              return acc;
            }, {}),
            dependencies: dagData.edges.map(edge => ({
              task_id: edge.target,
              depends_on_task_id: edge.source,
              type: edge.type || 'success',
              is_active: true,
            })),
          },
        },
      });

      // Save YAML file
      await axios.post('/api/dags/yaml', {
        name: dagData.name,
        content: yamlContent,
      });

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete a DAG
  deleteDAG: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/dags/${id}`);
      set((state) => ({
        dags: state.dags.filter((dag) => dag.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
})); 