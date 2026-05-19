"use client"

import * as React from "react"
import { useAuth, useFirestore, useUser, initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image as ImageIcon, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AuthScreen() {
  const auth = useAuth()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = React.useState("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage(null)
    
    initiateEmailSignIn(auth, email, password)
      .catch((err: any) => {
        setIsPending(false)
        let message = "Invalid email or password."
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          message = "Incorrect email or password. Please try again."
        } else if (err.code === 'auth/too-many-requests') {
          message = "Too many failed attempts. Please try again later."
        }
        setErrorMessage(message)
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: message
        })
      })
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      return
    }

    setIsPending(true)
    setErrorMessage(null)
    
    initiateEmailSignUp(auth, db, email, password)
      .then(() => {
        toast({
          title: "Account Created",
          description: "Welcome to SnapSpace! Your gallery is ready."
        })
      })
      .catch((err: any) => {
        setIsPending(false)
        let message = "Could not create your account."
        if (err.code === 'auth/email-already-in-use') {
          message = "This email is already registered. Please log in instead."
        } else if (err.code === 'auth/weak-password') {
          message = "Password is too weak. Please use at least 6 characters."
        } else if (err.code === 'auth/invalid-email') {
          message = "Please enter a valid email address."
        }
        setErrorMessage(message)
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: message
        })
      })
  }

  const handleGuest = () => {
    setIsPending(true)
    initiateAnonymousSignIn(auth).catch((err: any) => {
      setIsPending(false)
      toast({
        variant: "destructive",
        title: "Guest Access Failed",
        description: "Could not establish a guest session. Please try again."
      })
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-lg">
            <ImageIcon className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">SnapSpace</h1>
          <p className="text-muted-foreground mt-2">Your professional AI-powered image gallery</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setErrorMessage(null); }} className="w-full animate-in fade-in zoom-in-95 duration-700">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="shadow-md border-primary/10">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your gallery.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  {errorMessage && (
                    <Alert variant="destructive" className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                        disabled={isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full font-bold" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full"
                    onClick={handleGuest}
                    disabled={isPending}
                  >
                    Guest Access
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="shadow-md border-accent/20">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Start organizing your images with AI today.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  {errorMessage && (
                    <Alert variant="destructive" className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password (min. 6 characters)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                        disabled={isPending}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground px-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-accent" />
                      Requirement: Min. 6 characters (e.g. mother123)
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
