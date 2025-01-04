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

        <Accordion type="single" collapsible className="w-full max-w-5xl mx-auto ">
          <AccordionItem value="about">
            <AccordionTrigger>What is Money Wrapped?</AccordionTrigger>
            <AccordionContent>
              Money Wrapped is your personal financial year-in-review, inspired by Spotify Wrapped. 
              It analyzes your transaction history to create beautiful, insightful visualizations of 
              your spending patterns throughout the year. Upload or connect your banking data securely, and 
              discover fascinating insights about your financial habits - from your most frequent 
              merchants to your biggest spending categories. 
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="akahu">
            <AccordionTrigger>What is Akahu?</AccordionTrigger>
            <AccordionContent>
    
Akahu maintains deeply functional data integrations with NZ banks and other financial institutions. They bundle those integrations into a simple API for developers. 
<br/><br/>Money wrapped is sponsored with the use of their oneoff account and enrichment endpoints. If you'd like to use these endpoints for something else, contact them at the link below for commercials.
<br/><br/>
Akahu also supports the development of <a  className="underline text-blue-700" href="https://www.mbie.govt.nz/business-and-employment/business/competition-regulation-and-policy/consumer-data-right" target="_blank">Consumer Data Rights</a> in New Zealand, and they intend to evolve our integrations into that purpose-built regulatory regime when it rolls out and matures.
<br/><br/>You can learn more about the Akahu platform <a href="https://akahu.nz/" target="_blank" className="underline text-blue-700">here</a>.
            </AccordionContent>
          </AccordionItem>
          
          

          <AccordionItem value="security">
            <AccordionTrigger>How secure is my account data?</AccordionTrigger>
            <AccordionContent>
              Your financial data is protected using standard encryption practices and secure protocols. All backend processing happens on Cloudflare Workers. The analysis is entirely human-free, which means your financial 
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
          <AccordionItem value="bug">
            <AccordionTrigger>I found a bug, how do I report it?</AccordionTrigger>
            <AccordionContent>
              If you've found a bug, you can either join our Discord server to chat about it or file an issue on our GitHub repository. <br/>
              Visit our <a href="https://discord.gg/hjC3mZ4hsz" className="underline text-blue-700">Discord server</a> to chat about it, 
              or create an issue on our <a href="https://github.com/waltzaround/money-wrapped/issues" className="underline text-blue-700">GitHub repository</a>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="help">
            <AccordionTrigger>I can't get it to work, please help</AccordionTrigger>
            <AccordionContent>
              If you're using the CSV upload flow, first check that your CSV file matches the required format. <br/>
              Still having trouble? Join our <a href="https://discord.gg/hjC3mZ4hsz" className="underline text-blue-700">Discord server</a> and we'll help you out!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="authors">
            <AccordionTrigger>Who is this built by?</AccordionTrigger>
            <AccordionContent>
              Money Wrapped is built by <a href="https://walt.online" className="underline text-blue-700">Walter Lim</a>, <a href="https://laspruca.nz" className="underline text-blue-700">Connor Hare</a>, and <a href="https://jmw.nz" className="underline text-blue-700">Jasper Miller-Waugh</a>, 
            </AccordionContent>
          </AccordionItem>
       
       
      
        </Accordion>
      </div>
    </>
  );
}
