import Link from "next/link";

import { marcarNotificacaoLida } from "@/features/notificacoes/notificacoes.actions";
import type { Notification } from "@/shared/schemas/notifications.schema";

const EMPTY_COPY = "Nenhum aviso de risco de pagamento por enquanto.";
const MARK_READ_LABEL = "Marcar como lida";
const PAYMENTS_LINK_LABEL = "Ver pagamentos";
const READ_STATUS = "Lida";
const UNREAD_STATUS = "Não lida";

const KIND_LABEL: Record<Notification["kind"], string> = {
  purchase_refused: "Recusado",
  subscription_renewal_refused: "Recusado",
  subscription_late: "Atrasado",
  refund: "Reembolsado",
  chargeback: "Chargeback",
  subscription_late_recovered: "Recuperado",
  payment_failed: "Recusado",
  payment_refunded: "Reembolsado",
};

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDateTime(value: string): string {
  return dateTime.format(new Date(value));
}

export function NotificacoesInbox({
  notificacoes,
}: {
  notificacoes: Notification[];
}): React.ReactNode {
  if (notificacoes.length === 0) {
    return (
      <section className="app-development-card">
        <p className="text-sm leading-6 text-foreground/60">{EMPTY_COPY}</p>
      </section>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {notificacoes.map((notification) => {
        const unread = notification.read_at === null;
        return (
          <li
            className={`app-development-card${unread ? " app-notification-unread" : ""}`}
            key={notification.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="app-development-status">{KIND_LABEL[notification.kind]}</span>
                  <span className="text-xs text-foreground/50">
                    {unread ? UNREAD_STATUS : READ_STATUS}
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{notification.title}</h2>
                <p className="max-w-2xl text-sm leading-6 text-foreground/60">
                  {notification.body}
                </p>
                <p className="text-xs text-foreground/50">
                  Recebido em {formatDateTime(notification.created_at)}
                  {notification.next_payment_at
                    ? ` · Próximo pagamento: ${formatDateTime(notification.next_payment_at)}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {notification.payment_reference ? (
                  <Link className="app-secondary-button" href="/pagamentos">
                    {PAYMENTS_LINK_LABEL}
                  </Link>
                ) : null}
                {unread ? (
                  <form action={marcarNotificacaoLida.bind(null, notification.id)}>
                    <button className="app-secondary-button" type="submit">
                      {MARK_READ_LABEL}
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
