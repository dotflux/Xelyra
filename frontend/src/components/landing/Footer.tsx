import xelyraIcon from "../../../public/xelyra-icon.png";

const Footer = () => {
  return (
    <footer className="relative z-10 py-12 px-8 border-t border-[#2a2b2e]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <img src={xelyraIcon} alt="Xelyra" className="w-8 h-8" />
          <span className="text-xl font-bold text-white">Xelyra</span>
        </div>
        <div className="flex items-center space-x-6 text-gray-400">
          <span>© 2025 Xelyra. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
