
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { insertSampleNews } from "@/services/sampleDataService";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleInsertSampleData = async () => {
    try {
      await insertSampleNews();
      toast({
        title: "Success",
        description: "Sample news data has been inserted. View it in the news feed.",
        duration: 5000,
      });
      navigate("/");
    } catch (error) {
      console.error("Error inserting sample data:", error);
      toast({
        title: "Error",
        description: "Failed to insert sample data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">TMET News App</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Welcome to the Telecom, Media, Entertainment & Technology News app.
          </p>
          <div className="flex flex-col space-y-4">
            <Button asChild>
              <Link to="/">View News Feed</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">Sign In / Register</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="secondary" 
            onClick={handleInsertSampleData}
            className="w-full"
          >
            Insert Sample News Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
