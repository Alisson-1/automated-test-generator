import type { ApiStatus } from '../types';

type Props = {
  status: ApiStatus;
};

const labelByState: Record<ApiStatus['state'], string> = {
  loading: 'Verificando...',
  online: 'Online',
  offline: 'Offline',
};

export default function ApiStatus({ status }: Props) {
  return (
    <div>
      <span>API: {labelByState[status.state]}</span>
      {status.state === 'online' ? (
        <p>
          {status.service} — {new Date(status.timestamp).toLocaleString('pt-BR')}
        </p>
      ) : null}
      {status.state === 'offline' ? <p>{status.error}</p> : null}
    </div>
  );
}
