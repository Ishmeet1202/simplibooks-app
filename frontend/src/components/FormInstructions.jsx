import { Info } from "lucide-react";

const FormInstructions = ({ children }) => {
  return (
    <div className="mt-2">
      <p className="flex gap-2 text-sm font-normal p-2">
        <span>
          <Info className="text-yellow-500" />
        </span>
        {children}
      </p>
    </div>
  );
};

export default FormInstructions;
