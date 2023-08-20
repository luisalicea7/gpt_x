import Image from "next/image";
import Send from "../../public/send.svg";

export const Footer = () => {
  return (
    <footer className="bg-[#333333] p-9">
      <form>
        <fieldset className="flex gap-3">
          <textarea
            className="w-full resize-none rounded-md bg-[#3d3d3d] px-3 py-1 text-white focus:border-[#FFFFFF] focus:bg-[#474747] focus:outline focus:outline-[#ffffff]"
            placeholder="Send a message..."
          />
          <button type="submit" className="btn">
            {/* <Image id="send-button" src={Send} alt={"Image"} /> */}
            Send
          </button>
        </fieldset>
      </form>
    </footer>
  );
};
