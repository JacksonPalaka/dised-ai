"use client";

import * as z from "zod";
import axios from "axios";
import { Book } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";

import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import ReactMarkdown from "react-markdown";

import { formSchema } from "./constants";

const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt1: "",
      prompt2: "",
    }
  });

  const isLoading = form.formState.isSubmitting;


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionRequestMessage = { role: "user", content: values.prompt1 };
      // const userMessage2: ChatCompletionRequestMessage = { role: "user", content: values.prompt2 };
      // const otherMessage= {userMessage,userMessage2}
      const newMessages = [...messages, userMessage];

      const response = await axios.post('/api/conversation', { messages: newMessages });
      setMessages((current) => [...current, userMessage, response.data]);

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }

  return (
    <div>
      <Heading
        title="Resume Generation (beta)"
        description="Generate Resume using diSed's AI."
        icon={Book}
        iconColor="text-red-700"
        bgColor="bg-yellow-700/10"
      />
      <div className="px-4 lg:px-8">

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                my-1
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
              "
          >
            
            <FormField
              name="prompt1"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Paste your resume here"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="prompt2"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Paste your job description here"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
              Generate
            </Button>
          </form>
        </Form>
      </div>
      <div className="space-y-4 mt-4">
        <h1 className="text-xs ml-1">*   Use <b>PRO</b> version to paste pdfs.</h1>
        {isLoading && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
            <Loader />
          </div>
        )}
        {messages.length === 0 && !isLoading && (
          <Empty label="No conversation started." />
        )}
        <div className="flex flex-col-reverse gap-y-4">
          {messages.map((message) => (
            <div
              key={message.content}
              className={cn(
                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
              )}
            >
              {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
              <ReactMarkdown className="text-sm overflow-hidden leading-7">
                {message.content || " "}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConversationPage;

