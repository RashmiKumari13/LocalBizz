import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Send, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  shopName: string;
  phone?: string | null;
  backLabel?: string;
};

function formatWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

export function ContactActions({ shopName, phone, backLabel = "shop" }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function openWhatsApp() {
    if (!phone) return;
    const text = encodeURIComponent(
      `Hi! I found your ${backLabel} "${shopName}" on LocalBiz. I'd like to enquire about your services. Could you please help me?`
    );
    window.open(`https://wa.me/${formatWhatsApp(phone)}?text=${text}`, "_blank");
  }

  function sendEnquiry() {
    if (!phone) return;
    const fullMessage = `Hi! I'm ${name || "a customer"} from LocalBiz.\n\n${message || `I'd like to know more about ${shopName}.`}\n\nPlease get back to me. Thank you!`;
    const text = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${formatWhatsApp(phone)}?text=${text}`, "_blank");
    setEnquiryOpen(false);
    setName("");
    setMessage("");
  }

  function copyPhone() {
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div className="mt-6 space-y-2">
        {phone && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.open(`tel:${phone}`)}
              >
                <Phone size={16} className="mr-2" /> Call Now
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={openWhatsApp}
              >
                <MessageCircle size={16} className="mr-2" /> WhatsApp
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setEnquiryOpen(true)}>
                <Send size={15} className="mr-2" /> Send Enquiry
              </Button>
              <Button variant="outline" onClick={copyPhone}>
                {copied ? (
                  <><Check size={15} className="mr-2 text-green-500" /> Copied!</>
                ) : (
                  <><Copy size={15} className="mr-2" /> Copy Number</>
                )}
              </Button>
            </div>
          </>
        )}
        {!phone && (
          <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground text-center">
            No contact number available for this {backLabel}.
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {enquiryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setEnquiryOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Send Enquiry</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">Your message will be sent via WhatsApp</p>
                </div>
                <button
                  onClick={() => setEnquiryOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground mb-5 flex items-center gap-2">
                <MessageCircle size={13} className="text-green-600 shrink-0" />
                Sending to <span className="font-semibold text-foreground">{shopName}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="enq-name">Your Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    id="enq-name"
                    placeholder="Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="enq-msg">Message</Label>
                  <textarea
                    id="enq-msg"
                    rows={4}
                    placeholder={`Hi! I'd like to know more about your services at ${shopName}. Please share details...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setEnquiryOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={sendEnquiry}
                >
                  <MessageCircle size={15} className="mr-2" /> Send via WhatsApp
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
