import React from 'react'
import Head from 'next/head'
import Header from '../../components/header'
import Content from '../../components/content'
import ExtLink from '../../components/ext-link'
import blogStyles from '../../styles/blog.module.css'
import getBlogIndex from '../../lib/notion/getBlogIndex'
import loadPage from '../../lib/notion/loadPage'
import {
  loadTweets,
  getBlogLink,
  getDateStr,
  extractPostPreview,
} from '../../lib/blog-helpers'

export async function getStaticProps({ params: { slug } }) {
  const post = await loadPage(slug, 0, true)

  if (!post) {
    console.log(`Failed to find post for slug: ${slug}`)
    return {
      props: {
        redirect: '/posts',
      },
      revalidate: 5,
    }
  }

  const tweets = await loadTweets(post)

  return {
    props: {
      post,
      tweets,
    },
    revalidate: 10,
  }
}

// Return our list of blog posts to prerender
export async function getStaticPaths() {
  const postsTable = await getBlogIndex()
  return {
    paths: Object.keys(postsTable).map(slug => getBlogLink(slug)),
    fallback: true,
  }
}

const RenderPost = ({ post, tweets, redirect }) => {
  // XXX: why sometimes post is not here?
  if (redirect || !post) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta httpEquiv="refresh" content={`0;url=${redirect}`} />
        </Head>
      </>
    )
  }

  const description = extractPostPreview(post.content)
  return (
    <>
      <Header titlePre={post.Page} description={description} />
      <div className={blogStyles.post}>
        <h1>{post.Page || ''}</h1>

        <div className={blogStyles.posted}>
          <ExtLink href={`https://www.google.com.br/maps/search/${post.City}`}>
            {post.City}
          </ExtLink>{' '}
          · {getDateStr(post.Date)}
        </div>

        <hr />

        {(!post.content || post.content.length === 0) && (
          <p>This post has no content</p>
        )}

        <Content content={post.content} tweets={tweets} />
      </div>
    </>
  )
}

export default RenderPost
