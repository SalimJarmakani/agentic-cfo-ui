import type { User } from '../../services/api';
import WorkflowUserListItem from './WorkflowUserListItem';

type Props = {
  users: User[];
  selectedUserId: number | null;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onSelectUser: (userId: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export default function WorkflowUserPicker({
  users,
  selectedUserId,
  page,
  totalPages,
  loading,
  error,
  onSelectUser,
  onPreviousPage,
  onNextPage,
}: Props) {
  return (
    <section className="card workflow-card">
      <div className="workflow-card-head">
        <div>
          <h2 className="section-title">Choose User</h2>
          <p className="workflow-muted">Select which user the workflow should run against.</p>
        </div>
        <div className="workflow-user-pagination">
          <button className="pagination-btn" onClick={onPreviousPage} disabled={page === 1 || loading}>
            Prev
          </button>
          <span className="workflow-page-indicator">Page {page} of {Math.max(totalPages, 1)}</span>
          <button className="pagination-btn" onClick={onNextPage} disabled={page >= totalPages || loading}>
            Next
          </button>
        </div>
      </div>

      {error && <p className="workflow-error">{error}</p>}

      <div className="workflow-user-list">
        {loading ? (
          <p className="workflow-muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="workflow-muted">No users available.</p>
        ) : (
          users.map((user) => {
            return (
              <WorkflowUserListItem
                key={user.user_id}
                user={user}
                selected={user.user_id === selectedUserId}
                onSelect={onSelectUser}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
