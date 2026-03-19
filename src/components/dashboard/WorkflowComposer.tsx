type Props = {
  selectedUserId: number | null;
  question: string;
  loading: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
};

export default function WorkflowComposer({
  selectedUserId,
  question,
  loading,
  onQuestionChange,
  onSubmit,
}: Props) {
  return (
    <section className="card workflow-card">
      <div className="workflow-card-head">
        <div>
          <h2 className="section-title">Start Workflow</h2>
          <p className="workflow-muted">
            {selectedUserId ? `New run for user ${selectedUserId}.` : 'Choose a user before starting a run.'}
          </p>
        </div>
      </div>

      <label className="workflow-label" htmlFor="workflow-question">
        Question
      </label>
      <textarea
        id="workflow-question"
        className="workflow-textarea"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        rows={5}
        placeholder="Describe what you want the workflow to assess."
      />

      <div className="workflow-actions">
        <button
          type="button"
          className="workflow-primary-btn"
          disabled={loading || !selectedUserId || question.trim().length < 3}
          onClick={onSubmit}
        >
          {loading ? 'Starting...' : 'Start workflow'}
        </button>
      </div>
    </section>
  );
}
