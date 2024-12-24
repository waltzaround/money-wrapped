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
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

        <Accordion type="single" collapsible className="w-full max-w-3xl">
          <AccordionItem value="security">
            <AccordionTrigger>How secure is my account data?</AccordionTrigger>
            <AccordionContent>
              Your account data is protected using industry-standard encryption
              and security practices. We use secure protocols for all data
              transmission and storage, and your sensitive information is never
              stored in plain text.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="audit">
            <AccordionTrigger>Is the code auditable?</AccordionTrigger>
            <AccordionContent>
              Yes! Our codebase is fully open source and available for audit.
              You can review all of our code on GitHub, including our security
              implementations and data handling practices. We believe in
              transparency and welcome security researchers to review our code.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-handling">
            <AccordionTrigger>
              How is my data handled and stored?
            </AccordionTrigger>
            <AccordionContent>
              We follow strict data protection guidelines and comply with
              industry best practices. Your data is stored securely in encrypted
              databases, and we maintain regular backups to ensure data
              integrity. We never share your personal information with third
              parties without your explicit consent.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="access">
            <AccordionTrigger>Who has access to my data?</AccordionTrigger>
            <AccordionContent>
              Access to user data is strictly limited to essential personnel who
              need it to provide support or maintain the service. All access is
              logged and monitored, and we employ strict access controls and
              authentication measures to protect your information.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
