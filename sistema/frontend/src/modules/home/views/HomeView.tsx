import ApiStatus from '../components/ApiStatus';
import { useApiStatus } from '../hooks/useApiStatus';

export default function HomeView() {
  const status = useApiStatus();

  return (
    <main>
      <h1>Sistema de Provas</h1>
      <ApiStatus status={status} />
    </main>
  );
}
