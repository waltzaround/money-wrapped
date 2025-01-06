import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useNavigate } from "react-router";

const CATEGORIES = [
  "Accountancy, bookkeeping, auditing, and tax services",
  "Advertising and marketing services",
  "Agricultural supplies",
  "Air transport services",
  "Airports",
  "Antique stores and repair",
  "Apparel and accessory stores",
  "Appliance and furniture rentals",
  "Appliance repair and services",
  "Architect, engineering, and surveying services",
  "Art and craft supplies",
  "Art stores, dealers, and galleries",
  "Attractions, museums, zoos, amusement parks, circuses, exhibits",
  "Automotive body repair and painting services",
  "Automotive parts and accessories",
  "Automotive repair and servicing",
  "Bakeries",
  "Bars, pubs, nightclubs",
  "Bicycle stores, rentals, and repairs",
  "Boat dealers",
  "Boat rentals",
  "Boat transport services",
  "Body corporate",
  "Book stores",
  "Building and carpentry services",
  "Building supplies",
  "Bus and shuttle transport services",
  "Business services (not elsewhere classified)",
  "Business software and cloud services",
  "Cafes and restaurants",
  "Car and motorcycle rentals",
  "Car, truck, and motorcycle dealers",
  "Casino, lottery, and other gambling services",
  "Caterers",
  "Chemical products and services",
  "Child and infant clothing",
  "Childcare services",
  "Chiropodists and podiatrists",
  "Chiropractors and osteopaths",
  "Cigarette, vape, and other smoking products",
  "Cinemas",
  "Cleaning, sanitation, and pest control services",
  "Clothing alteration and repair",
  "Clothing rental",
  "Clothing stores",
  "Computer equipment",
  "Concrete services",
  "Consumer electronics repair and services",
  "Convenience stores",
  "Cosmetic supplies",
  "Cosmetic, health spas, and relaxation massage services",
  "Courier and freight delivery services",
  "Curtains, blinds, and window coverings",
  "Dating and matchmaking services",
  "Dental and medical laboratories",
  "Dental services",
  "Digital gaming products and services",
  "Doctors and physicians",
  "Duty free stores",
  "Education (not elsewhere classified)",
  "Electric vehicle charging services",
  "Electrical supplies and services",
  "Electricity and gas services",
  "Electricity services",
  "Electronic and appliance stores",
  "Employment and career services",
  "Entertainment (not elsewhere classified)",
  "Event venue and equipment rental",
  "Events and tickets (not elsewhere classified)",
  "Fabric, sewing, knitting, and related supplies",
  "Fast food stores",
  "Financial advice and wealth management",
  "Financial asset brokers, exchanges, and managed funds",
  "Financial services (not elsewhere classified)",
  "Fireplaces and supplies",
  "Fish and seafood supplies",
  "Floor covering stores",
  "Floral supplies and services",
  "Foreign exchange and money transfer services",
  "Fuel stations",
  "Funeral, death, and memorial services",
  "Gas services",
  "General retail stores",
  "Gift and souvenir stores",
  "Golf courses",
  "Gyms, fitness, aquatic facilities, yoga, pilates",
  "Haircuts and treatments",
  "Hardware equipment and supplies",
  "Heating, cooling, and ventilation equipment and services",
  "Hobby, toy, and physical game stores",
  "Home furnishing and repair stores",
  "Hospices",
  "Hospitals and emergency care",
  "Hotels, motels, and other temporary accommodation",
  "IT and software development services",
  "Ice cream, gelato, nut, and confectionary stores",
  "Industrial and commercial supplies (not elsewhere classified)",
  "Insurance",
  "Internet services",
  "Landscaping, garden, and horticultural services",
  "Laundry and drycleaning",
  "Legal services",
  "Lending services",
  "Libraries",
  "Liquor stores",
  "Local government",
  "Management consulting",
  "Marinas, marine supplies, and marine services",
  "Masonry, stonework, tiling, plastering, and insulation services",
  "Meal kit stores",
  "Meat supplies",
  "Media and entertainment streaming services",
  "Medical products and supplies (not elsewhere classified)",
  "Medical services (not elsewhere classified)",
  "Membership organisations (not elsewhere classified)",
  "Motor parks, campgrounds, holiday parks, recreational camps",
  "Musical equipment, recordings, and supplies",
  "National government services",
  "Newspapers, magazines, and literary subscriptions",
  "Nurseries and garden supplies",
  "Optometrists and eyewear",
  "Painting supplies and services",
  "Parking services",
  "Performing art training",
  "Personal software (not elsewhere classified)",
  "Pets and related supplies, accommodation, and services",
  "Pharmacies",
  "Photography equipment and services",
  "Physiotherapy and massage therapy",
  "Plumbing and gasfitting supplies and services",
  "Political organisations",
  "Postal services",
  "Primary and secondary schools",
  "Printing, publishing, and signmaking services",
  "Professional services (not elsewhere classified)",
  "Psychology, psychiatric, counselling, and other mental health services",
  "Real estate services",
  "Religious organisations",
  "Rent for permanent accommodation",
  "Repair and servicing (not elsewhere classified)",
  "Retirement accommodation",
  "Roofing services",
  "Secondhand and opportunity stores",
  "Security stores and services",
  "Shoe and leather repair, keycutting, or engraving",
  "Shoe stores",
  "Specialty food stores",
  "Specialty retail stores (not elsewhere classified)",
  "Sports and athletic clubs",
  "Sports equipment and supplies",
  "Stationery and office supplies",
  "Storage facilities",
  "Supermarkets and grocery stores",
  "Swimming pools, supplies, and services",
  "Tax payments",
  "Taxi, rideshare, and on-demand transport services",
  "Telecommunication services",
  "Testing laboratories (non medical)",
  "Theatre, concerts, and other artistic performances",
  "Toll fees",
  "Towing services",
  "Trade services (not elsewhere classified)",
  "Train and rail transport services",
  "Transport services (not elsewhere classified)",
  "Travel agencies and tour operators",
  "Truck, trailer, machinery, and equipment rentals",
  "Tyre stores",
  "Uniforms and commercial clothing",
  "Universities, professional schools, and other tertiary education",
  "Variety stores",
  "Vehicle dealers (not elsewhere classified)",
  "Veterinary services",
  "Waste and recycling services",
  "Watch, clock, and jewellery stores and services",
  "Water and sanitation services",
  "Welding, fabrication, and metal services",
  "Welfare and charity",
  "Wineries, breweries, and distilleries"
] as const;

const CATEGORY_GROUPS = [
  "Appearance",
  "Education",
  "Food",
  "Health",
  "Household",
  "Housing",
  "Lifestyle",
  "Professional Services",
  "Transport",
  "Utilities"
] as const;

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  direction: "DEBIT" | "CREDIT";
  _connection: string;
  type: string;
  merchant?: {
    id: string;
    name: string;
    logo: string;
  };
  category?: {
    name: string;
    group?: {
      personal_finance: {
        _id: string;
        name: string;
      };
    };
  };
}

export default function EditTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem("results");
      if (storedTransactions) {
        const parsedData = JSON.parse(storedTransactions);
        const rawTransactions = parsedData.raw_transactions || [];
        setTransactions(rawTransactions);
      }
    } catch (err) {
      setError("Error loading transactions");
      console.error("Error loading transactions:", err);
    }
  }, []);

  const handleSave = () => {
    try {
      const dataToSave = {
        raw_transactions: transactions
      };
      localStorage.setItem("results", JSON.stringify(dataToSave));
      navigate("/final-results");
    } catch (err) {
      setError("Error saving transactions");
      console.error("Error saving transactions:", err);
    }
  };

  const updateTransaction = (index: number, field: string, value: any) => {
    const updatedTransactions = [...transactions];
    const transaction = { ...updatedTransactions[index] };

    // Handle nested updates
    if (field === "category.group.personal_finance.name") {
      if (!transaction.category) transaction.category = {};
      if (!transaction.category.group) transaction.category.group = {};
      if (!transaction.category.group.personal_finance) {
        transaction.category.group.personal_finance = { _id: "", name: "" };
      }
      transaction.category.group.personal_finance.name = value;
    } else if (field === "category.name") {
      if (!transaction.category) transaction.category = {};
      transaction.category.name = value;
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'merchant') {
        if (!transaction.merchant) transaction.merchant = { id: "", name: "", logo: "" };
        transaction.merchant[child] = value;
      }
    } else {
      (transaction as any)[field] = value;
    }

    updatedTransactions[index] = transaction;
    setTransactions(updatedTransactions);
  };

  const handleDelete = (index: number) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Transactions</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-4">
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Merchant Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Category Group</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Input
                      type="datetime-local"
                      value={transaction.date.split('.')[0]}
                      onChange={(e) => updateTransaction(index, "date", e.target.value + ".000Z")}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={transaction.description}
                      onChange={(e) => updateTransaction(index, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={transaction.amount}
                      onChange={(e) => updateTransaction(index, "amount", parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={transaction.merchant?.name || ""}
                      onChange={(e) => updateTransaction(index, "merchant.name", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {transaction.category?.name || "Select category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search category..." />
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {CATEGORIES.map((category) => (
                              <CommandItem
                                key={category}
                                value={category}
                                onSelect={() => {
                                  updateTransaction(index, "category.name", category);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    transaction.category?.name === category ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {category}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={transaction.category?.group?.personal_finance?.name || "Transport"}
                      onValueChange={(value) => updateTransaction(index, "category.group.personal_finance.name", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category group" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDelete(index)}
                      size="sm"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
