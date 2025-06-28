"use client"
import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"


export default function Footer() {
  return (
    <footer className=" rounded-lg shadow w-full m-4">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <span className="self-center text-2xl font-semibold whitespace-nowrap ml-2">
              Meal<span className="text-green-500">Wise</span>
            </span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">
            <li>
              <Link href="/about" className="mr-4 hover:underline md:mr-6 ">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="mr-4 hover:underline md:mr-6">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/licensing" className="mr-4 hover:underline md:mr-6 ">
                Licensing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <hr className="my-6  sm:mx-auto lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center ">
          © {new Date().getFullYear()} {" "}
          <Link href="/" className="hover:underline">
            Meal<span className="text-green-500">Wise</span>
          </Link>
          All Rights Reserved.
        </span>
      </div>
    </footer>
  )
}