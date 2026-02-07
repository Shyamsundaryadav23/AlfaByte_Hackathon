import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate("/student/login");
  }
  return (
    <nav className="w-full flex justify-between items-center px-10 py-5 absolute top-0 z-50 text-white">
      <h1 className="text-xl font-bold tracking-wide">
        Campus Events
      </h1>

      <ul className="hidden md:flex gap-8 font-medium">
        <li className="hover:text-blue-400 cursor-pointer">Home</li>
        <li className="hover:text-blue-400 cursor-pointer">Clubs</li>
        <li className="hover:text-blue-400 cursor-pointer">Events</li>
        <li className="hover:text-blue-400 cursor-pointer">About</li>
        <li className="hover:text-blue-400 cursor-pointer">Contact</li>
      </ul>

      <button className="bg-blue-600 px-5 py-2 rounded-xl hover:bg-blue-700" onClick={handleOnClick}>
        Student Login
      </button>
    </nav>
  );
}
