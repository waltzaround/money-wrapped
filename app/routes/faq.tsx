import { Header } from "~/components/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function FAQPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

        <Accordion type="single" collapsible className="w-full max-w-5xl mx-auto">
          <AccordionItem value="about">
            <AccordionTrigger>What is Money Wrapped?</AccordionTrigger>
            <AccordionContent>
              Money Wrapped is your personal financial year-in-review, inspired by Spotify Wrapped. 
              It analyzes your transaction history to create beautiful, insightful visualizations of 
              your spending patterns throughout the year. Upload or connect your banking data securely, and 
              discover fascinating insights about your financial habits - from your most frequent 
              merchants to your biggest spending categories. All processing is done locally in your 
              browser for maximum privacy and security.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security">
            <AccordionTrigger>How secure is my account data?</AccordionTrigger>
            <AccordionContent>
              Your financial data is protected using standard encryption practices and secure protocols. All backend processing happens on Cloudflare Workers. The analysis is entirely algorithmic, which means your financial 
              information is processed purely by code, without any human involvement at any stage. <br/><br/>
              
              We believe in transparency, which is why our entire codebase is open source. You can review exactly how we handle 
              your data by checking out our implementation on <a href="https://github.com/waltzaround/money-wrapped" className="underline text-blue-700">GitHub</a>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="audit">
            <AccordionTrigger>Is the code auditable?</AccordionTrigger>
            <AccordionContent>
         Yep. The codebase is fully open source and available for audit.
              You can review all of the code on  <a href="https://github.com/waltzaround/money-wrapped" className="underline text-blue-700">GitHub.</a>
            </AccordionContent>
          </AccordionItem>

       
      
        </Accordion>
      </div>
    </>
  );
}
