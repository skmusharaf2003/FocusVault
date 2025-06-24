import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getTodayKey = () => new Date().toISOString().split("T")[0];

const QuoteCard = ({ quote, setQuote }) => {
    const setRandomQuote = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/study/quote`);
            if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
            const randomQuote = { text: response.data[0].q, author: response.data[0].a };
            localStorage.setItem("dailyQuote", JSON.stringify({ date: getTodayKey(), quote: randomQuote }));
            setQuote(randomQuote);
        } catch (error) {
            console.error("Failed to fetch quote:", error);
            setQuote({ text: "Keep pushing forward, one step at a time.", author: "Anonymous" });
        }
    }, [setQuote]);

    useEffect(() => {
        const saved = localStorage.getItem("dailyQuote");
        const today = getTodayKey();
        if (saved) {
            const { date, quote } = JSON.parse(saved);
            if (date === today) {
                setQuote(quote);
                return;
            }
        }
        setRandomQuote();
    }, [setRandomQuote]);

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer"
            onClick={setRandomQuote}
        >
            <div className="absolute top-0 right-0 opacity-10">
                <Quote size={120} />
            </div>
            <div className="relative z-10">
                <Quote className="mb-3" size={24} />
                <p className="text-lg font-medium leading-relaxed mb-2">"{quote.text}"</p>
                <p className="text-primary-100 font-medium">- {quote.author}</p>
                <p className="text-primary-200 text-xs mt-2">Tap for new quote</p>
            </div>
        </motion.div>
    );
};

export default QuoteCard;