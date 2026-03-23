import { useEffect, useState } from 'react';
import {
  createRecommendationFeedback,
  createValidatedQueryEvaluation,
  fetchAgentTokenUsage,
  fetchMetricsSummary,
} from '../services/api';
import type {
  AgentTokenUsage,
  MetricsSummary,
  RecommendationFeedbackRequest,
  RecommendationFeedbackResponse,
  ValidatedQueryEvaluationRequest,
  ValidatedQueryEvaluationResponse,
} from '../types';
import './Page.css';

function formatPercent(value: number | null): string {
  return value === null ? '--' : `${value.toFixed(2)}%`;
}

function formatMilliseconds(value: number | null): string {
  return value === null ? '--' : `${value.toFixed(2)} ms`;
}

function formatDecimal(value: number | null): string {
  return value === null ? '--' : value.toFixed(2);
}

function formatTokenCount(value: number | null | undefined): string {
  return value === null || value === undefined ? '--' : value.toFixed(2);
}

function normalizeBooleanInput(value: string): boolean | null | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  return undefined;
}

type QueryFormState = {
  question: string;
  expected_answer: string;
  actual_answer: string;
  top_k: string;
  is_correct: string;
  evaluator: string;
  notes: string;
};

type FeedbackFormState = {
  workflow_run_id: string;
  recommendation_stage: RecommendationFeedbackRequest['recommendation_stage'];
  usefulness_rating: string;
  clarity_rating: string;
  adopted: string;
  evaluator: string;
  comments: string;
};

const initialQueryForm: QueryFormState = {
  question: '',
  expected_answer: '',
  actual_answer: '',
  top_k: '10',
  is_correct: 'null',
  evaluator: '',
  notes: '',
};

const initialFeedbackForm: FeedbackFormState = {
  workflow_run_id: '',
  recommendation_stage: 'planning',
  usefulness_rating: '4',
  clarity_rating: '',
  adopted: 'null',
  evaluator: '',
  comments: '',
};

export default function Metrics() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [tokenUsage, setTokenUsage] = useState<AgentTokenUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [queryForm, setQueryForm] = useState<QueryFormState>(initialQueryForm);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormState>(initialFeedbackForm);
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [queryResult, setQueryResult] = useState<ValidatedQueryEvaluationResponse | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<RecommendationFeedbackResponse | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);
    try {
      const [summaryResponse, tokenUsageResponse] = await Promise.all([
        fetchMetricsSummary(),
        fetchAgentTokenUsage(),
      ]);
      setSummary(summaryResponse);
      setTokenUsage(tokenUsageResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function handleSubmitQueryEvaluation() {
    setSubmittingQuery(true);
    setQueryError(null);
    setQueryResult(null);

    const payload: ValidatedQueryEvaluationRequest = {
      question: queryForm.question.trim(),
      expected_answer: queryForm.expected_answer.trim(),
      top_k: Number(queryForm.top_k) || 10,
      is_correct: normalizeBooleanInput(queryForm.is_correct) ?? null,
      evaluator: queryForm.evaluator.trim() || undefined,
      notes: queryForm.notes.trim() || undefined,
    };

    if (queryForm.actual_answer.trim()) {
      payload.actual_answer = queryForm.actual_answer.trim();
    }

    try {
      const response = await createValidatedQueryEvaluation(payload);
      setQueryResult(response);
      setQueryForm(initialQueryForm);
      await loadSummary();
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Failed to submit validated query evaluation.');
    } finally {
      setSubmittingQuery(false);
    }
  }

  async function handleSubmitFeedback() {
    setSubmittingFeedback(true);
    setFeedbackError(null);
    setFeedbackResult(null);

    const payload: RecommendationFeedbackRequest = {
      workflow_run_id: Number(feedbackForm.workflow_run_id),
      recommendation_stage: feedbackForm.recommendation_stage,
      usefulness_rating: Number(feedbackForm.usefulness_rating),
      clarity_rating: feedbackForm.clarity_rating ? Number(feedbackForm.clarity_rating) : null,
      adopted: normalizeBooleanInput(feedbackForm.adopted) ?? null,
      evaluator: feedbackForm.evaluator.trim() || undefined,
      comments: feedbackForm.comments.trim() || undefined,
    };

    try {
      const response = await createRecommendationFeedback(payload);
      setFeedbackResult(response);
      setFeedbackForm(initialFeedbackForm);
      await loadSummary();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to submit recommendation feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  return (
    <div className="page metrics-page">
      <h1 className="page-title">Metrics</h1>
      <p className="page-sub">
        Operational and evaluation metrics for analytics accuracy, workflow reliability, policy intervention, latency, and human usefulness.
      </p>

      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      {loading && !summary ? (
        <div className="card"><p style={{ margin: 0, color: '#64748b' }}>Loading metrics...</p></div>
      ) : (
        <>
          <div className="metrics-card-grid">
            <div className="card metrics-stat-card">
              <span className="metrics-stat-label">Analytics Accuracy</span>
              <span className="metrics-stat-value">{formatPercent(summary?.analytics_accuracy_rate ?? null)}</span>
              <span className="metrics-stat-meta">{summary?.analytics_accuracy_total_evaluations ?? 0} validated evaluations</span>
            </div>
            <div className="card metrics-stat-card">
              <span className="metrics-stat-label">Workflow Completion Rate</span>
              <span className="metrics-stat-value">{formatPercent(summary?.workflow_completion_rate ?? null)}</span>
              <span className="metrics-stat-meta">{summary?.workflow_completed_runs ?? 0} of {summary?.workflow_total_runs ?? 0} runs completed</span>
            </div>
            <div className="card metrics-stat-card">
              <span className="metrics-stat-label">Policy Intervention Rate</span>
              <span className="metrics-stat-value">{formatPercent(summary?.policy_intervention_rate ?? null)}</span>
              <span className="metrics-stat-meta">{summary?.policy_intervention_count ?? 0} interventions across {summary?.policy_intervention_total_reviews ?? 0} reviews</span>
            </div>
            <div className="card metrics-stat-card">
              <span className="metrics-stat-label">Policy Compliance Rate</span>
              <span className="metrics-stat-value">{formatPercent(summary?.policy_compliance_rate ?? null)}</span>
              <span className="metrics-stat-meta">{summary?.policy_compliant_count ?? 0} compliant reviews</span>
            </div>
            <div className="card metrics-stat-card">
              <span className="metrics-stat-label">Average API Response Time</span>
              <span className="metrics-stat-value">{formatMilliseconds(summary?.average_api_response_time_ms ?? null)}</span>
              <span className="metrics-stat-meta">Measured from request logging middleware</span>
            </div>
            <div className="card metrics-stat-card">
              <span className="metrics-stat-label">Human Usefulness</span>
              <span className="metrics-stat-value">{formatDecimal(summary?.human_recommendation_usefulness_avg ?? null)}</span>
              <span className="metrics-stat-meta">{summary?.human_recommendation_usefulness_total_reviews ?? 0} feedback entries</span>
            </div>
          </div>

          <div className="metrics-layout">
            <div className="card metrics-panel">
              <h2 className="section-title">Workflow and Latency Detail</h2>
              <div className="metrics-detail-grid">
                <div className="metrics-detail-item">
                  <span className="metrics-detail-label">Completed Runs</span>
                  <span className="metrics-detail-value">{summary?.workflow_completed_runs ?? 0}</span>
                </div>
                <div className="metrics-detail-item">
                  <span className="metrics-detail-label">Failed Runs</span>
                  <span className="metrics-detail-value">{summary?.workflow_failed_runs ?? 0}</span>
                </div>
                <div className="metrics-detail-item">
                  <span className="metrics-detail-label">In-Progress Runs</span>
                  <span className="metrics-detail-value">{summary?.workflow_in_progress_runs ?? 0}</span>
                </div>
                <div className="metrics-detail-item">
                  <span className="metrics-detail-label">Avg Workflow Completion</span>
                  <span className="metrics-detail-value">{formatMilliseconds(summary?.average_workflow_completion_time_ms ?? null)}</span>
                </div>
              </div>

              <h3 className="metrics-subtitle">Average Stage Response Time</h3>
              <div className="metrics-stage-list">
                {Object.entries(summary?.average_stage_response_time_ms ?? {}).map(([stage, value]) => (
                  <div key={stage} className="metrics-stage-row">
                    <span className="metrics-stage-name">{stage}</span>
                    <span className="metrics-stage-value">{formatMilliseconds(value)}</span>
                  </div>
                ))}
              </div>

              <h3 className="metrics-subtitle">Average Agent Input Tokens</h3>
              <div className="metrics-stage-list">
                {Object.entries(tokenUsage?.average_input_tokens_by_agent ?? {}).map(([stage, value]) => (
                  <div key={stage} className="metrics-stage-row">
                    <span className="metrics-stage-name">{stage}</span>
                    <span className="metrics-stage-value">
                      {formatTokenCount(value)} tokens
                      {' · '}
                      {tokenUsage?.runs_with_input_tokens_by_agent?.[stage] ?? 0} runs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card metrics-panel">
              <h2 className="section-title">Validated Query Evaluation</h2>
              <p className="metrics-panel-copy">
                Store benchmark-style analytics checks. Leave `Actual answer` blank if you want the system to run the query and store the current answer automatically.
              </p>

              <div className="metrics-form-grid">
                <label className="page-select-wrap">
                  <span className="page-select-label">Question</span>
                  <textarea
                    className="workflow-textarea"
                    rows={3}
                    value={queryForm.question}
                    onChange={(event) => setQueryForm((current) => ({ ...current, question: event.target.value }))}
                  />
                </label>

                <label className="page-select-wrap">
                  <span className="page-select-label">Expected Answer</span>
                  <textarea
                    className="workflow-textarea"
                    rows={3}
                    value={queryForm.expected_answer}
                    onChange={(event) => setQueryForm((current) => ({ ...current, expected_answer: event.target.value }))}
                  />
                </label>

                <label className="page-select-wrap">
                  <span className="page-select-label">Actual Answer</span>
                  <textarea
                    className="workflow-textarea"
                    rows={3}
                    value={queryForm.actual_answer}
                    onChange={(event) => setQueryForm((current) => ({ ...current, actual_answer: event.target.value }))}
                  />
                </label>

                <div className="metrics-form-row">
                  <label className="page-select-wrap">
                    <span className="page-select-label">Top K</span>
                    <input
                      className="page-input"
                      type="number"
                      min={1}
                      max={100}
                      value={queryForm.top_k}
                      onChange={(event) => setQueryForm((current) => ({ ...current, top_k: event.target.value }))}
                    />
                  </label>

                  <label className="page-select-wrap">
                    <span className="page-select-label">Correct?</span>
                    <select
                      className="page-select"
                      value={queryForm.is_correct}
                      onChange={(event) => setQueryForm((current) => ({ ...current, is_correct: event.target.value }))}
                    >
                      <option value="null">Unknown</option>
                      <option value="true">Correct</option>
                      <option value="false">Incorrect</option>
                    </select>
                  </label>

                  <label className="page-select-wrap">
                    <span className="page-select-label">Evaluator</span>
                    <input
                      className="page-input"
                      type="text"
                      value={queryForm.evaluator}
                      onChange={(event) => setQueryForm((current) => ({ ...current, evaluator: event.target.value }))}
                    />
                  </label>
                </div>

                <label className="page-select-wrap">
                  <span className="page-select-label">Notes</span>
                  <textarea
                    className="workflow-textarea"
                    rows={2}
                    value={queryForm.notes}
                    onChange={(event) => setQueryForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </label>
              </div>

              {queryError && <p style={{ color: '#ef4444', marginTop: 12 }}>{queryError}</p>}
              {queryResult && (
                <p className="metrics-success-copy">
                  Saved evaluation #{queryResult.evaluation_id}. Stored answer length: {queryResult.actual_answer.length} characters.
                </p>
              )}

              <div className="workflow-actions">
                <button
                  type="button"
                  className="workflow-primary-btn"
                  disabled={submittingQuery || queryForm.question.trim().length < 3 || queryForm.expected_answer.trim().length === 0}
                  onClick={handleSubmitQueryEvaluation}
                >
                  {submittingQuery ? 'Saving...' : 'Save query evaluation'}
                </button>
              </div>
            </div>
          </div>

          <div className="card metrics-panel">
            <h2 className="section-title">Recommendation Feedback</h2>
            <p className="metrics-panel-copy">
              Record human usefulness and clarity ratings for workflow recommendations. This feeds the usefulness metric directly.
            </p>

            <div className="metrics-form-grid">
              <div className="metrics-form-row">
                <label className="page-select-wrap">
                  <span className="page-select-label">Workflow Run ID</span>
                  <input
                    className="page-input"
                    type="number"
                    min={1}
                    value={feedbackForm.workflow_run_id}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, workflow_run_id: event.target.value }))}
                  />
                </label>

                <label className="page-select-wrap">
                  <span className="page-select-label">Stage</span>
                  <select
                    className="page-select"
                    value={feedbackForm.recommendation_stage}
                    onChange={(event) =>
                      setFeedbackForm((current) => ({
                        ...current,
                        recommendation_stage: event.target.value as FeedbackFormState['recommendation_stage'],
                      }))
                    }
                  >
                    <option value="analysis">Analysis</option>
                    <option value="planning">Planning</option>
                    <option value="policy">Policy</option>
                    <option value="explanation">Explanation</option>
                  </select>
                </label>

                <label className="page-select-wrap">
                  <span className="page-select-label">Usefulness (1-5)</span>
                  <input
                    className="page-input"
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackForm.usefulness_rating}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, usefulness_rating: event.target.value }))}
                  />
                </label>

                <label className="page-select-wrap">
                  <span className="page-select-label">Clarity (1-5)</span>
                  <input
                    className="page-input"
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackForm.clarity_rating}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, clarity_rating: event.target.value }))}
                  />
                </label>
              </div>

              <div className="metrics-form-row">
                <label className="page-select-wrap">
                  <span className="page-select-label">Adopted?</span>
                  <select
                    className="page-select"
                    value={feedbackForm.adopted}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, adopted: event.target.value }))}
                  >
                    <option value="null">Unknown</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>

                <label className="page-select-wrap">
                  <span className="page-select-label">Evaluator</span>
                  <input
                    className="page-input"
                    type="text"
                    value={feedbackForm.evaluator}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, evaluator: event.target.value }))}
                  />
                </label>
              </div>

              <label className="page-select-wrap">
                <span className="page-select-label">Comments</span>
                <textarea
                  className="workflow-textarea"
                  rows={3}
                  value={feedbackForm.comments}
                  onChange={(event) => setFeedbackForm((current) => ({ ...current, comments: event.target.value }))}
                />
              </label>
            </div>

            {feedbackError && <p style={{ color: '#ef4444', marginTop: 12 }}>{feedbackError}</p>}
            {feedbackResult && (
              <p className="metrics-success-copy">
                Saved feedback #{feedbackResult.feedback_id} for workflow run #{feedbackResult.workflow_run_id}.
              </p>
            )}

            <div className="workflow-actions">
              <button
                type="button"
                className="workflow-primary-btn"
                disabled={submittingFeedback || Number(feedbackForm.workflow_run_id) <= 0}
                onClick={handleSubmitFeedback}
              >
                {submittingFeedback ? 'Saving...' : 'Save recommendation feedback'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
