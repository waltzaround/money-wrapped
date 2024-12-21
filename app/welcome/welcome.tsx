import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function Welcome() {
  return (
    <>
      <main className="flex items-center justify-center pt-16 pb-4 ">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <section className="w-full max-w-[80rem] mx-auto">
            <div className=" ">
              <h1 className="text-4xl font-bold">Money Wrapped</h1>
              <p className="text-sm text-gray-500">Powered by Akahu</p>
              <p className="text-2xl mt-4">
                Understand how you spent your money in 2024. There are two ways
                to do this:
              </p>
            </div>
            <div className="mt-8">
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="flex-1 rounded-lg border border-gray-300 p-4 bg-white hover:border-blue-500"
                >
                  <h3 className="text-2xl font-bold underline text-blue-700 mb-2">
                    Sign up for Akahu to get your data
                  </h3>
                  <p className=" text-gray-700 mb-4">
                    Use Akahu to get your bank data reviewed. We don't store any
                    of it after you leave the site and you can verify this at
                    the repo link below - our code is fully open source.
                  </p>
                  <Button>Sign up</Button>
                </Link>
                <Link
                  to="/prepare"
                  className="flex-1 rounded-lg border border-gray-300 p-4 bg-white"
                >
                  <h3 className="text-2xl font-bold underline text-blue-700 mb-2 ">
                    Upload a CSV
                  </h3>
                  <p className=" text-gray-700 mb-4">
                    Dont trust the website? That's okay - Upload a CSV and it
                    can still process your spending for the year. We don't store
                    your data and you can verify this at the repo below - our
                    code is fully open source.
                  </p>
                  <Button>Upload CSV</Button>
                </Link>
              </div>

              <div className="w-full rounded-md border min-h-40 mt-24">
                <h2>Walt's year in review</h2>
                <p>1,230 Transactions</p> <p>301 different businesses</p>
                <p>Total spent $12,300</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="flex flex-col items-center gap-4 p-4">
        <a href="github">Github Repo</a>
        <p>
          Made by Walter Lim, Jasper Miller-Waugh, Young-Ju Lee and the Akahu
          Team
        </p>
      </footer>
    </>
  );
}
