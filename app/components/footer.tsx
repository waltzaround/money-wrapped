export function Footer() {
  return (
    <footer className="mt-16 pb-8 text-center text-sm text-gray-500 flex flex-col gap-2">
      <div>
        Built with care by{" "}
        <a
          href="https://walt.online"
          className="underline text-blue-600 hover:text-blue-700"
        >
          Walter Lim
        </a>
        ,{" "}
        <a
          href="https://laspruca.nz"
          className="underline text-blue-600 hover:text-blue-700"
        >
          Connor Hare
        </a>
        , and{" "}
        <a
          href="https://jmw.nz"
          className="underline text-blue-600 hover:text-blue-700"
        >
          Jasper Miller-Waugh
        </a>
      </div>
      <div>
        Made possible with support from{" "}
        <a
          href="https://akahu.nz"
          className="underline text-blue-600 hover:text-blue-700"
        >
          Akahu
        </a>
      </div>
      <div>
        <a href="/privacy" className="underline text-blue-600 hover:text-blue-700">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
