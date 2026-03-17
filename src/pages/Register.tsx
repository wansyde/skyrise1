import { useSearchParams, Navigate } from "react-router-dom";

const Register = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const target = ref ? `/login?tab=register&ref=${ref}` : "/login?tab=register";
  return <Navigate to={target} replace />;
};

export default Register;
