// src/pages/RegisterPage.jsx
import { useState, useRef, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, X, Check } from "lucide-react";
import FormInstructions from "../components/FormInstructions";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%]).{8,24}$/;
const NAME_REGEX = /^[A-Za-z' -]{2,24}$/;

const RegisterPage = () => {
  const nameRef = useRef();
  const { register, user, hasOrganization } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [validName, setValidName] = useState(false);
  const [focusName, setFocusName] = useState(false);

  const [validEmail, setValidEmail] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);

  const [validPassword, setValidPassword] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const [validMatch, setValidMatch] = useState(false);
  const [focusMatch, setFocusMatch] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(formData.email));
  }, [formData.email]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(formData.name));
  }, [formData.name]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(formData.password));
    setValidMatch(formData.password === formData.confirmPassword && formData.password !== "");
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    setError("");
  }, [formData]);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      if (hasOrganization) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
      return;
    }

    setError(result.message);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 p-4 text-white">
      <div className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-5 duration-500 rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-lg">
        <div className="space-y-4 text-center">
          <span className="text-3xl font-bold text-indigo-400">🧾 SimpliBooks</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Create your account</h1>
          <p className="text-sm text-slate-400">Start managing your business finances today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="rounded-md border border-red-900 bg-red-900/20 p-3 text-sm font-semibold text-red-400">{error}</div>}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="flex gap-2 items-center text-sm font-medium text-slate-300">
                Full Name
                {validName && formData.name ? <Check className="text-green-600 w-4 h-4" /> : focusName && <X className="text-red-600 w-4 h-4" />}
              </label>
              <input id="name" name="name" type="text" ref={nameRef} autoComplete="off"
                     onFocus={() => setFocusName(true)} onBlur={() => setFocusName(false)} required
                     className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50"
                     placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
              {focusName && formData.name && !validName && <FormInstructions>Full Name must contain 2–24 characters.</FormInstructions>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="flex gap-2 items-center text-sm font-medium text-slate-300">
                Email address
                {validEmail && formData.email ? <Check className="text-green-600 w-4 h-4" /> : focusEmail && <X className="text-red-600 w-4 h-4" />}
              </label>
              <input id="email" name="email" type="email" autoComplete="off"
                     onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} required
                     className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50"
                     placeholder="Enter your email" value={formData.email} onChange={handleChange} />
              {focusEmail && formData.email && !validEmail && <FormInstructions>Must be a valid email address</FormInstructions>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="flex gap-2 items-center text-sm font-medium text-slate-300">
                Password
                {validPassword && formData.password ? <Check className="text-green-600 w-4 h-4" /> : focusPassword && <X className="text-red-600 w-4 h-4" />}
              </label>
              <input id="password" name="password" type="password" autoComplete="off"
                     onFocus={() => setFocusPassword(true)} onBlur={() => setFocusPassword(false)} required
                     className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50"
                     placeholder="Create a password" value={formData.password} onChange={handleChange} />
              {focusPassword && !validPassword && <FormInstructions>8 to 24 characters. Must include uppercase, lowercase, a number, and a special character (!@#$%).</FormInstructions>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="flex gap-2 items-center text-sm font-medium text-slate-300">
                Confirm Password
                {validMatch && formData.confirmPassword ? <Check className="text-green-600 w-4 h-4" /> : focusMatch && <X className="text-red-600 w-4 h-4" />}
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoCapitalize="off"
                     onFocus={() => setFocusMatch(true)} onBlur={() => setFocusMatch(false)} required
                     className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50"
                     placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
              {!validMatch && formData.password && formData.confirmPassword && <FormInstructions>Must match the password.</FormInstructions>}
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading || !validName || !validEmail || !validPassword || !validMatch}
                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-400 underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
