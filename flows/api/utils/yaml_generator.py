import yaml
from datetime import datetime

def generate_yaml(dag_data):
    """
    Generate YAML content from DAG data.
    
    Args:
        dag_data (dict): Dictionary containing DAG information
        
    Returns:
        str: YAML-formatted string
    """
    yaml_data = {
        'name': dag_data['name'],
        'description': dag_data.get('description', ''),
        'schedule': dag_data.get('schedule', None),
        'start_date': datetime.utcnow().isoformat(),
        'tasks': {}
    }
    
    # Process tasks
    for task in dag_data.get('tasks', []):
        task_id = task['id']
        yaml_data['tasks'][task_id] = {
            'operator': task['operator'],
            'params': task.get('params', {}),
            'dependencies': task.get('dependencies', [])
        }
    
    return yaml.dump(yaml_data, default_flow_style=False, sort_keys=False) 