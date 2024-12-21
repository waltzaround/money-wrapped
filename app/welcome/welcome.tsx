import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function Welcome() {
  return (
    <>
      <main className="flex items-center justify-center pt-16 pb-4 ">
        <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
          <section className="w-full max-w-[80rem] mx-auto">
            <div className=" ">
              <div className=" flex items-center gap-3">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg w-16 h-16"></div>
                <div>
                  <h1 className="text-4xl font-semibold">Money Wrapped</h1>
                  <p className="text-sm text-gray-500">Sponsored by Akahu</p>
                </div>
              </div>
              <p className="text-2xl mt-8">
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
                    Sign up to Akahu
                  </h3>
                  <p className=" text-gray-700 mb-4">
                    Use Akahu to get your spending data reviewed faster. We
                    don't store your data after you leave the site and you can
                    verify this at the repo link below - the code is fully open
                    source.
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
                    your data and you can verify this at the repo below - the
                    code is fully open source.
                  </p>
                  <Button>Upload CSV</Button>
                </Link>
              </div>
              <h2 className="mt-12 text-2xl font-semibold">
                Example Demo - Walt's year in review
              </h2>
              <p className="text-2xl mt-2 mb-4">In 2024, you...</p>

              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border border-gray-300 p-4 bg-white">
                  <p className="text-xl font-semibold">Spent $12,300</p>
                </div>

                <div className="flex-1 rounded-lg border border-gray-300 p-4 bg-white">
                  <p className="text-xl font-semibold">
                    Across 301 different businesses
                  </p>
                </div>
                <div className="flex-1 rounded-lg border border-gray-300 p-4 bg-white">
                  <p className="text-xl font-semibold">
                    over 1,230 Transactions
                  </p>
                </div>
              </div>

              <div className="w-full rounded-md border min-h-40 mt-8 p-4">
                <h2 className="text-xl font-semibold">Monthly Breakdown</h2>
                <p>Graph to go here</p>
                <ul className="list-disc list-inside">
                  <li>January: $1,000</li>
                  <li>February: $900</li>
                  <li>March: $1,100</li>
                  <li>April: $950</li>
                  <li>May: $1,200</li>
                  <li>June: $1,050</li>
                  <li>July: $1,300</li>
                  <li>August: $1,150</li>
                  <li>September: $1,000</li>
                  <li>October: $1,250</li>
                  <li>November: $1,100</li>
                  <li>December: $1,300</li>
                </ul>
              </div>
              <div className="w-full rounded-md border min-h-40 mt-8 p-4">
                <h2 className="text-xl font-semibold">Top Categories</h2>
                <ul className="list-disc list-inside">
                  <li>Groceries: $3,000</li>
                  <li>Rent: $6,000</li>
                  <li>Utilities: $1,200</li>
                  <li>Entertainment: $1,500</li>
                  <li>Dining Out: $1,600</li>
                </ul>
              </div>
              <div className="w-full rounded-md border min-h-40 mt-8 p-4">
                <h2 className="text-xl font-semibold">Top Merchants</h2>
                <ul className="list-disc list-inside">
                  <li>Supermarket A: $2,000</li>
                  <li>Landlord: $6,000</li>
                  <li>Utility Company: $1,200</li>
                  <li>Restaurant B: $800</li>
                  <li>Movie Theater: $700</li>
                </ul>
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
