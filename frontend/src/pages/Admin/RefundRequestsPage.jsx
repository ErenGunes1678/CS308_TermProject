import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRefundRequests, resolveRefundRequest } from '../../services/orderService';
import './RefundRequestsPage.css';

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

const RefundRequestCard = ({ request, onResolve, resolvingId }) => {
  const item = request.orderItem;
  const product = item?.product;
  const order = item?.order;
  const isPending = request.status === 'pending';
  const refundAmount = Number(request.refund_amount || 0);

  return (
    <article className="refund-card">
      <header className="refund-card__header">
        <div>
          <p className="refund-card__eyebrow">Refund #{request.id}</p>
          <h3>{product?.name || `Product #${item?.product_id || 'N/A'}`}</h3>
          <p className="refund-card__meta">
            Order #{order?.id || item?.order_id} • Requested {formatDate(request.requested_at)}
          </p>
        </div>
        <span className={`refund-status refund-status--${request.status}`}>
          {STATUS_LABELS[request.status] || request.status}
        </span>
      </header>

      <div className="refund-card__body">
        <div className="refund-card__image">
          {product?.image ? <img src={product.image} alt={product.name} /> : null}
        </div>
        <div className="refund-card__details">
          <span>Customer: {request.user?.email || 'N/A'}</span>
          <span>Quantity: {Number(item?.quantity || 0)}</span>
          <span>Purchased at: ${Number(item?.unit_price || 0).toFixed(2)}</span>
          <span>Refund amount: ${refundAmount.toFixed(2)}</span>
          {request.reason ? <p>{request.reason}</p> : null}
        </div>
      </div>

      <footer className="refund-card__footer">
        {request.resolved_at ? (
          <span>
            Resolved {formatDate(request.resolved_at)}
            {request.resolver?.email ? ` by ${request.resolver.email}` : ''}
          </span>
        ) : (
          <span>Awaiting returned product confirmation</span>
        )}

        {isPending ? (
          <div className="refund-card__actions">
            <button
              type="button"
              className="refund-card__button refund-card__button--reject"
              disabled={resolvingId === request.id}
              onClick={() => onResolve(request.id, 'rejected')}
            >
              Reject
            </button>
            <button
              type="button"
              className="refund-card__button refund-card__button--approve"
              disabled={resolvingId === request.id}
              onClick={() => onResolve(request.id, 'approved')}
            >
              {resolvingId === request.id ? 'Saving...' : 'Approve Refund'}
            </button>
          </div>
        ) : null}
      </footer>
    </article>
  );
};

const RefundRequestsPage = () => {
  const { user, isLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [activeStatus, setActiveStatus] = useState('pending');

  const isSalesManager = user?.role === 'sales_manager';

  useEffect(() => {
    if (isLoading || !user || !isSalesManager) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;
    const loadRequests = async () => {
      try {
        setIsPageLoading(true);
        setErrorMessage('');
        const data = await getRefundRequests();
        if (isMounted) {
          setRequests(Array.isArray(data?.refundRequests) ? data.refundRequests : []);
        }
      } catch (error) {
        if (isMounted) {
          setRequests([]);
          setErrorMessage(error?.response?.data?.message || 'Unable to load refund requests.');
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    loadRequests();
    return () => {
      isMounted = false;
    };
  }, [isLoading, user, isSalesManager]);

  const counts = useMemo(() => {
    const map = { pending: 0, approved: 0, rejected: 0 };
    requests.forEach((request) => {
      map[request.status] = (map[request.status] || 0) + 1;
    });
    return map;
  }, [requests]);

  const filteredRequests = useMemo(
    () => requests.filter((request) => request.status === activeStatus),
    [requests, activeStatus]
  );

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSalesManager) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleResolve = async (requestId, status) => {
    try {
      setResolvingId(requestId);
      const data = await resolveRefundRequest(requestId, status);
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? data.refundRequest : request
        )
      );
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to resolve refund request.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="refunds-page">
      <section className="refunds-hero">
        <div className="refunds-hero__overlay" />
        <div className="refunds-hero__bubbles" aria-hidden="true">
          <span className="refunds-hero__bubble refunds-hero__bubble--1" />
          <span className="refunds-hero__bubble refunds-hero__bubble--2" />
          <span className="refunds-hero__bubble refunds-hero__bubble--3" />
        </div>
        <div className="container refunds-hero__content">
          <p className="refunds-hero__eyebrow">Sales Manager</p>
          <h1 className="refunds-hero__title">Refund Requests</h1>
          <p className="refunds-hero__tagline">Review returned products and authorize customer refunds.</p>
        </div>
      </section>

      <main className="container refunds-panel">
        <div className="refunds-summary">
          <div>
            <p className="refunds-summary__label">Refund Queue</p>
            <h2 className="refunds-summary__title">{STATUS_LABELS[activeStatus]} refund requests</h2>
          </div>
          <div className="refunds-summary__tabs" role="tablist" aria-label="Refund request status">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={activeStatus === status}
                className={`refunds-summary__tab refunds-summary__tab--${status} ${activeStatus === status ? 'is-active' : ''}`}
                onClick={() => setActiveStatus(status)}
              >
                {label}: {counts[status] || 0}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? <div className="refunds-alert">{errorMessage}</div> : null}

        {isPageLoading ? (
          <div className="refunds-empty">Loading refund requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="refunds-empty">No {STATUS_LABELS[activeStatus].toLowerCase()} refund requests.</div>
        ) : (
          <div className="refunds-list">
            {filteredRequests.map((request) => (
              <RefundRequestCard
                key={request.id}
                request={request}
                onResolve={handleResolve}
                resolvingId={resolvingId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RefundRequestsPage;
