import type { User } from '../../services/api';

type Props = {
  user: User;
  selected: boolean;
  onSelect: (userId: number) => void;
};

export default function WorkflowUserListItem({ user, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`workflow-user-item${selected ? ' workflow-user-item--active' : ''}`}
      onClick={() => onSelect(user.user_id)}
    >
      <span className="workflow-user-topline">
        <span className="workflow-user-id">User {user.user_id}</span>
        <span className="workflow-user-credit">Score {user.credit_score}</span>
      </span>
      <span className="workflow-user-meta">
        Age {user.current_age} | {user.gender} | {user.num_credit_cards} cards
      </span>
      <span className="workflow-user-meta">
        Income ${user.yearly_income.toLocaleString()} | Debt ${user.total_debt.toLocaleString()}
      </span>
    </button>
  );
}
