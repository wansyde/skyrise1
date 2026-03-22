import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const statusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved" || s === "completed") return <CheckCircle className="h-3.5 w-3.5 text-success" />;
  if (s === "pending") return <Clock className="h-3.5 w-3.5 text-warning animate-pulse" />;
  return <XCircle className="h-3.5 w-3.5 text-destructive" />;
};

const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved" || s === "completed") return "text-success";
  if (s === "pending") return "text-warning";
  return "text-destructive";
};

const Records = () => {
  const { user } = useAuth();

  const { data: transactions = [] } = useQuery({
    queryKey: ["records-transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: deposits = [] } = useQuery({
    queryKey: ["records-deposits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["records-withdrawals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const fmt = (d: string) => format(new Date(d), "MMM d, yyyy");

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your complete activity history.</p>
        </div>

        {/* Task History (from transactions with type) */}
        <Section title="Task History">
          {transactions.filter(t => t.type === "task" || t.type === "roi").length === 0 && <Empty />}
          {transactions
            .filter(t => t.type === "task" || t.type === "roi")
            .map((t, i) => (
              <Row key={t.id} i={i} type={t.type} amount={t.amount} status={t.status} date={fmt(t.created_at)} method={t.method} />
            ))}
        </Section>

        {/* Deposit History */}
        <Section title="Deposit History">
          {deposits.length === 0 && <Empty />}
          {deposits.map((d, i) => (
            <Row key={d.id} i={i} type="Deposit" amount={d.amount} status={d.status} date={fmt(d.created_at)} method={d.method} />
          ))}
        </Section>

        {/* Withdrawal History */}
        <Section title="Withdrawal History">
          {withdrawals.length === 0 && <Empty />}
          {withdrawals.map((w, i) => (
            <Row key={w.id} i={i} type="Withdrawal" amount={w.amount} status={w.status} date={fmt(w.created_at)} method={w.method} />
          ))}
        </Section>
      </div>
    </AppLayout>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-sm font-medium mb-3">{title}</h3>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const Empty = () => (
  <div className="glass-card p-4 text-center text-xs text-muted-foreground">No records yet.</div>
);

const Row = ({ i, type, amount, status, date, method }: { i: number; type: string; amount: number; status: string; date: string; method?: string | null }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.03, duration: 0.25 }}
    className="glass-card flex items-center justify-between p-3.5"
  >
    <div className="flex items-center gap-2.5">
      {statusIcon(status)}
      <div>
        <span className="text-sm font-medium capitalize">{type}</span>
        {method && <span className="text-[10px] text-muted-foreground block mt-0.5">{method}</span>}
      </div>
    </div>
    <div className="text-right">
      <span className="text-sm font-medium tabular-nums">${amount.toLocaleString()}</span>
      <div className="flex items-center gap-1.5 justify-end mt-0.5">
        <span className={`text-[10px] capitalize ${statusClass(status)}`}>{status}</span>
        <span className="text-[10px] text-muted-foreground">· {date}</span>
      </div>
    </div>
  </motion.div>
);

export default Records;
